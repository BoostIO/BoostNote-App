import {
  NoteStorage,
  ObjectMap,
  PopulatedFolderDoc,
  PopulatedTagDoc,
  NoteStorageData,
} from './types'
import { useState, useCallback } from 'react'
import ow from 'ow'
import { schema, isValid } from '../predicates'
import { entries } from './utils'
import { LiteStorage } from 'ltstrg'
import { produce, enableMapSet } from 'immer'
import { values } from './utils'
import { storageDataListKey } from '../localStorageKeys'
import FSNoteDb from './FSNoteDb'

enableMapSet()

export interface DbStore {
  initialized: boolean
  storageMap: ObjectMap<NoteStorage>
  initialize: () => Promise<ObjectMap<NoteStorage>>
  removeStorage: (id: string) => Promise<void>
}

export function createDbStoreCreator(liteStorage: LiteStorage) {
  return (): DbStore => {
    const [initialized, setInitialized] = useState(false)
    const [storageMap, setStorageMap] = useState<ObjectMap<NoteStorage>>({})

    const initialize = useCallback(async () => {
      const storageDataList = getStorageDataListOrFix(liteStorage)

      const prepared = await Promise.all(
        storageDataList.map((storage) => prepareStorage(storage))
      )
      const storageMap = prepared.reduce((map, storage) => {
        map[storage.id] = storage
        return map
      }, {} as ObjectMap<NoteStorage>)

      saveStorageDataList(liteStorage, storageMap)
      setStorageMap(storageMap)
      setInitialized(true)

      return storageMap
    }, [setStorageMap])

    const removeStorage = useCallback(
      async (id: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }
        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap((prevStorageMap) => {
          newStorageMap = produce(prevStorageMap, (draft) => {
            delete draft[id]
          })

          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap!)
      },
      // FIXME: The callback regenerates every storageMap change.
      // We should move the method to NoteStorage so the method instantiate only once.
      [setStorageMap, storageMap]
    )

    return {
      initialized,
      storageMap,
      initialize,
      removeStorage,
    }
  }
}

const storageDataPredicate = schema({
  id: ow.string,
  name: ow.string,
  type: ow.string,
})

export function getStorageDataList(
  liteStorage: LiteStorage
): NoteStorageData[] | null {
  const serializedStorageDataList = liteStorage.getItem(storageDataListKey)
  try {
    const parsedStorageDataList = JSON.parse(serializedStorageDataList || '[]')
    if (!Array.isArray(parsedStorageDataList)) {
      throw new Error('storage data is corrupted')
    }

    return parsedStorageDataList.reduce((validatedList, parsedStorageData) => {
      if (
        isValid(parsedStorageData, storageDataPredicate) &&
        parsedStorageData.type === 'fs'
      ) {
        validatedList.push(parsedStorageData)
      }
      return validatedList
    }, [])
  } catch (error) {
    console.warn(error)
    return null
  }
}

function getStorageDataListOrFix(liteStorage: LiteStorage): NoteStorageData[] {
  let storageDataList = getStorageDataList(liteStorage)
  if (storageDataList == null) {
    storageDataList = []
    liteStorage.setItem(storageDataListKey, '[]')
  }
  return storageDataList
}

function saveStorageDataList(
  liteStorage: LiteStorage,
  storageMap: ObjectMap<NoteStorage>
) {
  liteStorage.setItem(
    storageDataListKey,
    JSON.stringify(
      values(storageMap).map((storage) => {
        const { id, name, location } = storage

        return {
          id,
          name,
          type: 'fs',
          location,
        }
      })
    )
  )
}

async function prepareStorage(
  storageData: NoteStorageData
): Promise<NoteStorage> {
  const { id, name } = storageData
  const db = new FSNoteDb(id, name, storageData.location)
  await db.init()

  const { noteMap, folderMap, tagMap } = await db.getAllDocsMap()
  const attachmentMap = await db.getAttachmentMap()
  const populatedFolderMap = entries(folderMap).reduce<
    ObjectMap<PopulatedFolderDoc>
  >((map, [pathname, folderDoc]) => {
    map[pathname] = {
      ...folderDoc,
      pathname,
      noteIdSet: new Set(),
    }

    return map
  }, {})
  const populatedTagMap = entries(tagMap).reduce<ObjectMap<PopulatedTagDoc>>(
    (map, [name, tagDoc]) => {
      map[name] = {
        ...tagDoc,
        name,
        noteIdSet: new Set(),
      }
      return map
    },
    {}
  )
  const bookmarkedIdSet = new Set<string>()

  for (const noteDoc of values(noteMap)) {
    if (noteDoc.trashed) {
      continue
    }
    populatedFolderMap[noteDoc.folderPathname]!.noteIdSet.add(noteDoc._id)
    noteDoc.tags.forEach((tag) => {
      populatedTagMap[tag]!.noteIdSet.add(noteDoc._id)
    })
    if (noteDoc.data.bookmarked) {
      bookmarkedIdSet.add(noteDoc._id)
    }
  }
  const bookmarkedItemIds = [...bookmarkedIdSet]

  return {
    type: 'fs',
    id,
    name,
    location: storageData.location,
    noteMap,
    folderMap: populatedFolderMap,
    tagMap: populatedTagMap,
    attachmentMap,
    db: db as FSNoteDb,
    bookmarkedItemIds,
  }
}

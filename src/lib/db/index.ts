import { NoteStorage, NoteStorageData } from './types'
import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../utils/context'
import ow from 'ow'
import { schema, isValid } from '../utils/predicates'
import NoteDb from './NoteDb'
import { generateUuid } from './utils'
import PouchDB from './PouchDB'

const storageDataListKey = 'note.boostio.co:storageDataList'

export interface DbContext {
  initialized: boolean
  storageMap: Map<string, NoteStorage>
  initialize: () => Promise<void>
  createStorage: (name: string) => Promise<void>
  removeStorage: (id: string) => Promise<void>
}

function createDbStoreCreator(browserStorage: Storage) {
  return (): DbContext => {
    const [initialized, setInitialized] = useState(false)
    const [storageMap, setStorageMap] = useState<Map<string, NoteStorage>>(
      new Map()
    )

    const initialize = useCallback(async () => {
      const storageDataList = loadStorageDataList(browserStorage)
      const storages = await Promise.all(storageDataList.map(prepareStorage))

      setInitialized(true)
      setStorageMap(
        storages.reduce((map, storage) => {
          map.set(storage.id, storage)
          return map
        }, new Map())
      )
    }, [])

    const createStorage = useCallback(async (name: string) => {
      const id = generateUuid()
      const storage = await prepareStorage({
        id,
        name
      })

      setStorageMap(prevStorageMap => {
        const newMap = new Map(prevStorageMap)
        newMap.set(id, storage)
        return newMap
      })
    }, [])

    const removeStorage = useCallback(async (id: string) => {
      setStorageMap(prevStorageMap => {
        const newMap = new Map(prevStorageMap)
        newMap.delete(id)
        return newMap
      })
    }, [])

    useEffect(
      () => {
        if (initialized) {
          browserStorage.setItem(
            storageDataListKey,
            JSON.stringify(
              [...storageMap.values()].map(({ id, name }) => ({ id, name }))
            )
          )
        }
      },
      [storageMap, initialized]
    )

    return {
      initialized,
      storageMap,
      initialize,
      createStorage,
      removeStorage
    }
  }
}

const storageDataPredicate = schema({
  id: ow.string,
  name: ow.string
})

export const {
  StoreProvider: DbProvider,
  useStore: useDb
} = createStoreContext(createDbStoreCreator(localStorage))

function loadStorageDataList(browserStorage: Storage): NoteStorageData[] {
  const serializedStorageDataList = browserStorage.getItem(storageDataListKey)

  try {
    const parsedStorageDataList = JSON.parse(serializedStorageDataList || '[]')
    if (!Array.isArray(parsedStorageDataList))
      throw new Error('storage data is corrupted')

    return parsedStorageDataList.reduce<NoteStorageData[]>(
      (validatedList, parsedStorageData) => {
        if (isValid(parsedStorageData, storageDataPredicate)) {
          validatedList.push(parsedStorageData)
        }
        return validatedList
      },
      []
    )
  } catch (error) {
    console.warn(error)
    browserStorage.setItem(storageDataListKey, '[]')
    return []
  }
}

async function prepareStorage({
  id,
  name
}: NoteStorageData): Promise<NoteStorage> {
  const pouchdb = new PouchDB(id, { adapter: 'idb' })
  const db = new NoteDb(pouchdb, id, name)
  await db.init()

  const { noteMap, folderMap, tagMap } = await db.getAllDocsMap()
  const storage: NoteStorage = {
    id,
    name,
    noteMap,
    folderMap: new Map(
      [...folderMap.entries()].map(([pathname, folderDoc]) => [
        pathname,
        {
          ...folderDoc,
          pathname,
          noteIdSet: new Set()
        }
      ])
    ),
    tagMap: new Map(
      [...tagMap.entries()].map(([name, tagDoc]) => [
        name,
        { ...tagDoc, name, noteIdSet: new Set() }
      ])
    ),
    db
  }

  for (const noteDoc of noteMap.values()) {
    storage.folderMap.get(noteDoc.folderPathname)!.noteIdSet.add(noteDoc._id)
    noteDoc.tags.forEach(tagName => {
      storage.tagMap.get(tagName)!.noteIdSet.add(noteDoc._id)
    })
  }

  return storage
}

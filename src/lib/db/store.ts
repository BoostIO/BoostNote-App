import { NoteStorage, NoteStorageData, ObjectMap } from './types'
import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../utils/context'
import ow from 'ow'
import { schema, isValid } from '../utils/predicates'
import NoteDb from './NoteDb'
import { generateUuid } from './utils'
import PouchDB from './PouchDB'
import { omit } from 'ramda'
import { LiteStorage, localLiteStorage } from 'ltstrg'

const storageDataListKey = 'note.boostio.co:storageDataList'

export interface DbStore {
  initialized: boolean
  storageMap: ObjectMap<NoteStorage>
  initialize: () => Promise<void>
  createStorage: (name: string) => Promise<NoteStorage>
  removeStorage: (id: string) => Promise<void>
  renameStorage: (id: string, name: string) => Promise<void>
  createFolder: (storageName: string, pathname: string) => Promise<void>
}

export function createDbStoreCreator(
  liteStorage: LiteStorage,
  adapter: 'idb' | 'memory'
) {
  return (): DbStore => {
    const [initialized, setInitialized] = useState(false)
    const [storageMap, setStorageMap] = useState<ObjectMap<NoteStorage>>({})

    const initialize = useCallback(async () => {
      const storageDataList = getStorageDataListOrFix(liteStorage)
      const storages = await Promise.all(
        storageDataList.map(storageData => prepareStorage(storageData, adapter))
      )

      setInitialized(true)
      setStorageMap(
        storages.reduce(
          (map, storage) => {
            map[storage.id] = storage
            return map
          },
          {} as ObjectMap<NoteStorage>
        )
      )
    }, [])

    const createStorage = useCallback(async (name: string) => {
      const id = generateUuid()
      const storage = await prepareStorage(
        {
          id,
          name
        },
        adapter
      )

      setStorageMap(prevStorageMap => {
        return {
          ...prevStorageMap,
          [id]: storage
        }
      })
      return storage
    }, [])

    const removeStorage = useCallback(
      async (id: string) => {
        await storageMap[id].db.pouchDb.destroy()
        setStorageMap(prevStorageMap => {
          return omit([id], prevStorageMap)
        })
      },
      // FIXME: The callback regenerates every storageMap change.
      // We should move the method to NoteStorage so the method instantiate only once.
      [storageMap]
    )

    const renameStorage = useCallback(async (id: string, name: string) => {
      setStorageMap(prevStorageMap => {
        return {
          ...prevStorageMap,
          [id]: {
            ...prevStorageMap[id],
            name
          }
        }
      })
    }, [])

    useEffect(
      () => {
        if (initialized) {
          liteStorage.setItem(
            storageDataListKey,
            JSON.stringify(
              Object.values(storageMap).map(({ id, name }) => ({ id, name }))
            )
          )
        }
      },
      [storageMap, initialized]
    )

    const createFolder = useCallback(
      async (id: string, pathname: string) => {
        const folderDoc = await storageMap[id].db.upsertFolder(pathname)
        setStorageMap(prevStorageMap => {
          return {
            ...prevStorageMap,
            [id]: {
              ...prevStorageMap[id],
              folderMap: {
                ...prevStorageMap[id].folderMap,
                [pathname]: {
                  ...folderDoc,
                  pathname,
                  noteIdSet: new Set()
                }
              }
            }
          }
        })
      },
      [storageMap]
    )

    return {
      initialized,
      storageMap,
      initialize,
      createStorage,
      removeStorage,
      renameStorage,
      createFolder
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
} = createStoreContext(createDbStoreCreator(localLiteStorage, 'idb'))

export function getStorageDataList(
  liteStorage: LiteStorage
): NoteStorageData[] | null {
  const serializedStorageDataList = liteStorage.getItem(storageDataListKey)

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

async function prepareStorage(
  { id, name }: NoteStorageData,
  adapter: 'idb' | 'memory'
): Promise<NoteStorage> {
  const pouchdb = new PouchDB(id, { adapter })
  const db = new NoteDb(pouchdb, id, name)
  await db.init()

  const { noteMap, folderMap, tagMap } = await db.getAllDocsMap()
  const storage: NoteStorage = {
    id,
    name,
    noteMap,
    folderMap: Object.entries(folderMap).reduce(
      (map, [pathname, folderDoc]) => {
        map[pathname] = {
          ...folderDoc,
          pathname,
          noteIdSet: new Set()
        }

        return map
      },
      {}
    ),
    tagMap: Object.entries(tagMap).reduce((map, [name, tagDoc]) => {
      map[name] = { ...tagDoc, name, noteIdSet: new Set() }
      return map
    }, {}),
    db
  }

  for (const noteDoc of Object.values(noteMap)) {
    storage.folderMap[noteDoc.folderPathname].noteIdSet.add(noteDoc._id)
    noteDoc.tags.forEach(tagName => {
      storage.tagMap[tagName].noteIdSet.add(noteDoc._id)
    })
  }

  return storage
}

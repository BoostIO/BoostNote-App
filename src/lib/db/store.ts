import {
  NoteStorage,
  NoteStorageData,
  ObjectMap,
  PopulatedFolderDoc
} from './types'
import { useState, useCallback } from 'react'
import { createStoreContext } from '../utils/context'
import ow from 'ow'
import { schema, isValid } from '../utils/predicates'
import NoteDb from './NoteDb'
import {
  generateUuid,
  getFolderPathname,
  getParentFolderPathname
} from './utils'
import PouchDB from './PouchDB'
import { LiteStorage, localLiteStorage } from 'ltstrg'
import { produce } from 'immer'
import { useRouter } from '../router'

const storageDataListKey = 'note.boostio.co:storageDataList'

export interface DbStore {
  initialized: boolean
  storageMap: ObjectMap<NoteStorage>
  initialize: () => Promise<void>
  createStorage: (name: string) => Promise<NoteStorage>
  removeStorage: (id: string) => Promise<void>
  renameStorage: (id: string, name: string) => Promise<void>
  createFolder: (storageName: string, pathname: string) => Promise<void>
  removeFolder: (storageName: string, pathname: string) => Promise<void>
}

export function createDbStoreCreator(
  liteStorage: LiteStorage,
  adapter: 'idb' | 'memory'
) {
  return (): DbStore => {
    const router = useRouter()
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

      let newStorageMap: ObjectMap<NoteStorage>
      setStorageMap(prevStorageMap => {
        newStorageMap = produce(prevStorageMap, draft => {
          draft[id] = storage
        })

        return newStorageMap
      })

      saveStorageDataList(liteStorage, newStorageMap!)
      return storage
    }, [])

    const removeStorage = useCallback(
      async (id: string) => {
        await storageMap[id].db.pouchDb.destroy()
        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap(prevStorageMap => {
          newStorageMap = produce(prevStorageMap, draft => {
            delete draft[id]
          })

          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap!)
      },
      // FIXME: The callback regenerates every storageMap change.
      // We should move the method to NoteStorage so the method instantiate only once.
      [storageMap]
    )

    const renameStorage = useCallback(async (id: string, name: string) => {
      let newStorageMap: ObjectMap<NoteStorage>
      setStorageMap(prevStorageMap => {
        newStorageMap = produce(prevStorageMap, draft => {
          draft[id].name = name
        })

        return newStorageMap
      })

      saveStorageDataList(liteStorage, newStorageMap!)
    }, [])

    const createFolder = useCallback(
      async (id: string, pathname: string) => {
        await storageMap[id].db.upsertFolder(pathname)
        const allFolders = await storageMap[id].db.getAllFolders()

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[id].folderMap = allFolders.reduce<
              ObjectMap<PopulatedFolderDoc>
            >((map, folderDoc) => {
              const currentPathname = getFolderPathname(folderDoc._id)
              map[currentPathname] = {
                ...folderDoc,
                pathname: currentPathname,
                noteIdSet: new Set()
              }
              return map
            }, {})
          })
        )
      },
      [storageMap]
    )

    const removeFolder = useCallback(
      async (id: string, pathname: string) => {
        await storageMap[id].db.removeFolder(pathname)
        const allFolders = await storageMap[id].db.getAllFolders()

        if (router.pathname.startsWith(`/storages/${id}/notes${pathname}`)) {
          router.push(
            `/storages/${id}/notes${getParentFolderPathname(pathname)}`
          )
        }

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[id].folderMap = allFolders.reduce<
              ObjectMap<PopulatedFolderDoc>
            >((map, folderDoc) => {
              const currentPathname = getFolderPathname(folderDoc._id)
              map[currentPathname] = {
                ...folderDoc,
                pathname: currentPathname,
                noteIdSet: new Set()
              }
              return map
            }, {})
          })
        )
      },
      [storageMap, router.pathname]
    )

    return {
      initialized,
      storageMap,
      initialize,
      createStorage,
      removeStorage,
      renameStorage,
      createFolder,
      removeFolder
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

function saveStorageDataList(
  liteStorage: LiteStorage,
  storageMap: ObjectMap<NoteStorage>
) {
  liteStorage.setItem(
    storageDataListKey,
    JSON.stringify(
      Object.values(storageMap).map(({ id, name }) => ({ id, name }))
    )
  )
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

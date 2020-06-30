import {
  NoteStorage,
  PouchNoteStorageData,
  ObjectMap,
  NoteDoc,
  NoteDocEditibleProps,
  PopulatedFolderDoc,
  PopulatedTagDoc,
  Attachment,
  CloudNoteStorageData,
  TagDoc,
  NoteStorageData,
  PouchNoteStorage,
  FSNoteStorage,
} from './types'
import { useState, useCallback, useEffect, useRef } from 'react'
import ow from 'ow'
import { schema, isValid } from '../predicates'
import PouchNoteDb from './PouchNoteDb'
import {
  getFolderPathname,
  getParentFolderPathname,
  getAllParentFolderPathnames,
  entries,
} from './utils'
import { generateId } from '../string'
import PouchDB from './PouchDB'
import { LiteStorage } from 'ltstrg'
import { produce } from 'immer'
import { RouterStore } from '../router'
import { values } from '../db/utils'
import { storageDataListKey } from '../localStorageKeys'
import { TAG_ID_PREFIX } from './consts'
import { difference } from 'ramda'
import { useToast } from '../toast'
import { useFirstUser, usePreferences } from '../preferences'
import { useRefState } from '../hooks'
import FSNoteDb from './FSNoteDb'

const autoSyncIntervalTime = 1000 * 60 * 60 // Every one hour
const autoSyncDebounceWaitingTime = 1000 * 30 // 30 seconds after updating data
export interface DbStore {
  initialized: boolean
  storageMap: ObjectMap<NoteStorage>
  initialize: () => Promise<void>
  createStorage: (
    name: string,
    props?: { type: 'fs'; location: string }
  ) => Promise<NoteStorage>
  removeStorage: (id: string) => Promise<void>
  renameStorage: (id: string, name: string) => void
  renameCloudStorage: (id: string, cloudStorageName: string) => void
  linkStorage: (id: string, cloudStorage: CloudNoteStorageData) => void
  unlinkStorage: (id: string) => void
  syncStorage: (id: string) => Promise<void>
  queueSyncingStorage: (id: string, delay?: number) => void
  queueSyncingAllStorage: (delay?: number) => void
  cancelSyncingStorageQueue: (id: string) => void
  createFolder: (storageName: string, pathname: string) => Promise<void>
  renameFolder: (
    storageName: string,
    pathname: string,
    newName: string
  ) => Promise<void>
  removeFolder: (storageName: string, pathname: string) => Promise<void>
  createNote(
    storageId: string,
    noteProps: Partial<NoteDocEditibleProps>
  ): Promise<NoteDoc | undefined>
  updateNote(
    storageId: string,
    noteId: string,
    noteProps: Partial<NoteDocEditibleProps>
  ): Promise<NoteDoc | undefined>
  trashNote(storageId: string, noteId: string): Promise<NoteDoc | undefined>
  untrashNote(storageId: string, noteId: string): Promise<NoteDoc | undefined>
  purgeNote(storageId: string, noteId: string): Promise<void>
  removeTag(storageId: string, tag: string): Promise<void>
  moveNoteToOtherStorage(
    originalStorageId: string,
    noteId: string,
    targetStorageId: string,
    targetFolderPathname: string
  ): Promise<void>
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
  removeAttachment(storageId: string, fileName: string): Promise<void>
}

export function createDbStoreCreator(
  liteStorage: LiteStorage,
  routerHook: () => RouterStore,
  pathnameWithoutNoteIdGetter: () => string
) {
  return (): DbStore => {
    const router = routerHook()
    const currentPathnameWithoutNoteId = pathnameWithoutNoteIdGetter()
    const [initialized, setInitialized] = useState(false)
    const [storageMap, storageMapRef, setStorageMap] = useRefState<
      ObjectMap<NoteStorage>
    >({})
    const { pushMessage } = useToast()
    const user = useFirstUser()
    const { preferences } = usePreferences()
    const enableAutoSync = preferences['general.enableAutoSync']
    const enableAutoSyncRef = useRef(enableAutoSync)
    useEffect(() => {
      enableAutoSyncRef.current = enableAutoSync
    }, [enableAutoSync])

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
    }, [setStorageMap])

    const createStorage = useCallback(
      async (name: string, props?: { type: 'fs'; location: string }) => {
        const id = generateId()

        const storageData: PouchNoteStorageData = { id, name }

        const storage = await prepareStorage({
          ...storageData,
          ...props,
        })

        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap((prevStorageMap) => {
          newStorageMap = produce(prevStorageMap, (draft) => {
            draft[id] = storage
          })

          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap!)
        return storage
      },
      [setStorageMap]
    )

    const unlinkStorage = useCallback(
      (storageId: string) => {
        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap((prevStorageMap) => {
          const existingStorage = prevStorageMap[storageId]
          if (existingStorage == null) {
            return prevStorageMap
          }
          if (existingStorage.type === 'fs') {
            return prevStorageMap
          }
          const newStorage = {
            ...existingStorage,
          }
          if (newStorage.cloudStorage != null) {
            delete newStorage.cloudStorage
          }

          newStorageMap = {
            ...prevStorageMap,
            [storageId]: newStorage,
          }
          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap!)
      },
      [setStorageMap]
    )

    const syncStorage = useCallback(
      async (storageId: string, silent = false) => {
        if (user == null) {
          return
        }
        setStorageMap((prevStorageMap) => {
          const storage = prevStorageMap[storageId]
          if (storage == null) {
            return prevStorageMap
          }
          if (storage.type === 'fs') {
            return prevStorageMap
          }
          if (storage.cloudStorage == null) {
            return prevStorageMap
          }
          if (storage.sync != null) {
            return prevStorageMap
          }
          const sync = storage.db
            .sync(user, storage.cloudStorage)
            .on('error', (error) => {
              switch ((error as any).status) {
                case 409:
                  if (!silent) {
                    pushMessage({
                      title: 'Size Limit',
                      description:
                        'You have reached your usage limit. Please upgrade your subscription.',
                    })
                  }
                  console.error('The cloud storage does not exist anymore.')
                  unlinkStorage(storageId)
                case 404:
                  if (!silent) {
                    pushMessage({
                      title: 'Not Found',
                      description: 'The cloud storage does not exist anymore.',
                    })
                  }
                  console.error('The cloud storage does not exist anymore.')
                  unlinkStorage(storageId)
                  break
                default:
                  if (!silent) {
                    pushMessage({
                      title: 'Sync Error',
                      description:
                        "Failed to sync the storage. Please check Dev Tool's console to learn more information",
                    })
                  }
                  console.error(error)
              }

              setStorageMap((prevStorageMap) => {
                return produce(prevStorageMap, (draft) => {
                  ;(draft[storageId]! as PouchNoteStorage).sync = undefined
                })
              })
            })
            .on('complete', async () => {
              const syncedStorage = (await prepareStorage(
                storage
              )) as PouchNoteStorage
              syncedStorage.cloudStorage!.syncedAt = Date.now()
              let newStorageMap: ObjectMap<NoteStorage>
              setStorageMap((prevStorageMap) => {
                newStorageMap = produce(prevStorageMap, (draft) => {
                  if (draft[storageId] == null) {
                    return
                  }
                  draft[storageId] = syncedStorage
                })
                return newStorageMap
              })

              saveStorageDataList(liteStorage, newStorageMap!)
            })

          return produce(prevStorageMap, (draft) => {
            ;(draft[storageId]! as PouchNoteStorage).sync = sync
          })
        })
      },
      [pushMessage, setStorageMap, unlinkStorage, user]
    )

    const queueSyncingStorage = useCallback(
      (storageId: string, delay = autoSyncIntervalTime) => {
        if (!enableAutoSyncRef.current) {
          return
        }

        setStorageMap((prevStorageMap) => {
          const storage = prevStorageMap[storageId]
          if (storage == null) {
            return prevStorageMap
          }
          if (storage.type === 'fs') {
            return prevStorageMap
          }
          if (storage.syncTimer != null) {
            clearTimeout(storage.syncTimer)
          }
          const newStorage = {
            ...storage,
            syncTimer: setTimeout(() => {
              syncStorage(storageId, true)
              queueSyncingStorage(storageId)
            }, delay),
          }

          return {
            ...prevStorageMap,
            [storageId]: newStorage,
          }
        })
      },
      [setStorageMap, syncStorage]
    )

    const queueSyncingAllStorage = useCallback(
      (delay?: number) => {
        const storageIds = Object.keys(storageMapRef.current)

        for (const storageId of storageIds) {
          queueSyncingStorage(storageId, delay)
        }
      },
      [storageMapRef, queueSyncingStorage]
    )

    const cancelSyncingStorageQueue = useCallback(
      (storageId: string) => {
        setStorageMap((prevStorageMap) => {
          const storage = prevStorageMap[storageId]
          if (storage == null) {
            return prevStorageMap
          }
          if (storage.type === 'fs') {
            return prevStorageMap
          }
          if (storage.syncTimer == null) {
            return prevStorageMap
          }
          clearTimeout(storage.syncTimer)

          const newStorage = {
            ...storage,
          }
          delete newStorage.syncTimer

          return {
            ...prevStorageMap,
            [storageId]: newStorage,
          }
        })
      },
      [setStorageMap]
    )

    const cancelAllSyncingStorageQueue = useCallback(() => {
      const storageIds = Object.keys(storageMapRef.current)

      for (const storageId of storageIds) {
        cancelSyncingStorageQueue(storageId)
      }
    }, [storageMapRef, cancelSyncingStorageQueue])

    useEffect(() => {
      if (enableAutoSync) {
        queueSyncingAllStorage()
      } else {
        cancelAllSyncingStorageQueue()
      }
    }, [queueSyncingAllStorage, cancelAllSyncingStorageQueue, enableAutoSync])

    const linkStorage = useCallback(
      (storageId: string, cloudStorage: CloudNoteStorageData) => {
        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap((prevStorageMap) => {
          const existingStorage = prevStorageMap[storageId]
          if (existingStorage == null) {
            return prevStorageMap
          }
          const newStorage = {
            ...existingStorage,
            cloudStorage,
          }

          newStorageMap = {
            ...prevStorageMap,
            [storageId]: newStorage,
          }
          return newStorageMap
        })
        saveStorageDataList(liteStorage, newStorageMap!)
      },
      [setStorageMap]
    )

    const removeStorage = useCallback(
      async (id: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }

        if (storage.type !== 'fs') {
          await storage.db.pouchDb.destroy()
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

    const renameStorage = useCallback(
      (id: string, name: string) => {
        const storageData = storageMap[id]
        if (storageData == null) {
          return
        }

        let newStorageMap: ObjectMap<NoteStorage> = {}
        setStorageMap((prevStorageMap) => {
          newStorageMap = produce(prevStorageMap, (draft) => {
            draft[id]!.name = name
          })
          return newStorageMap
        })
        saveStorageDataList(liteStorage, newStorageMap)
      },
      [setStorageMap, storageMap]
    )

    const renameCloudStorage = useCallback(
      (id: string, cloudStorageName: string) => {
        const storageData = storageMap[id]
        if (storageData == null || storageData.type === 'fs') {
          return
        }
        if (storageData.cloudStorage == null) {
          return
        }

        let newStorageMap: ObjectMap<NoteStorage> = {}
        setStorageMap((prevStorageMap) => {
          newStorageMap = produce(prevStorageMap, (draft) => {
            ;(draft[
              id
            ]! as PouchNoteStorage).cloudStorage!.name = cloudStorageName
          })
          return newStorageMap
        })
        saveStorageDataList(liteStorage, newStorageMap)
      },
      [setStorageMap, storageMap]
    )

    const createFolder = useCallback(
      async (storageId: string, pathname: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        let folder
        try {
          folder = await storage.db.upsertFolder(pathname)
        } catch (error) {
          pushMessage({
            title: 'Error',
            description: 'Folder name is invalid.',
          })
          console.error(error)
          return
        }
        const parentFolders = await storage.db.getFoldersByPathnames(
          getAllParentFolderPathnames(pathname)
        )
        const createdFolders = [folder, ...parentFolders].reverse()

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            createdFolders.forEach((aFolder) => {
              const aPathname = getFolderPathname(aFolder._id)
              if (storage.folderMap[aPathname] == null) {
                draft[storageId]!.folderMap[aPathname] = {
                  ...aFolder,
                  pathname: aPathname,
                  noteIdSet: new Set(),
                }
              }
            })
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)
      },
      [storageMap, setStorageMap, queueSyncingStorage, pushMessage]
    )

    const renameFolder = useCallback(
      async (storageId: string, pathname: string, newPathname: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const {
          folders,
          notes,
          removedFolders,
        } = await storage.db.renameFolder(pathname, newPathname)

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            notes.forEach((noteDoc) => {
              draft[storage.id]!.noteMap[noteDoc._id] = noteDoc
            })
            folders.forEach((folderDoc) => {
              draft[storage.id]!.folderMap[folderDoc.pathname] = folderDoc
            })
            removedFolders.forEach((aPathname) => {
              delete draft[storageId]!.folderMap[aPathname]
            })
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const removeFolder = useCallback(
      async (storageId: string, pathname: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        await storage.db.removeFolder(pathname)
        if (
          `${currentPathnameWithoutNoteId}/`.startsWith(
            `/app/storages/${storageId}/notes${pathname}/`
          )
        ) {
          router.replace(
            `/app/storages/${storageId}/notes${getParentFolderPathname(
              pathname
            )}`
          )
        }

        const deletedFolderPathnames = [
          pathname,
          ...Object.keys(storage.folderMap).filter((aPathname) =>
            aPathname.startsWith(`${pathname}/`)
          ),
        ]

        const noteIds = Object.keys(storage.noteMap)
        const affectedTagIdAndNotesIdMap = new Map<string, string[]>()
        const modifiedNotes: ObjectMap<NoteDoc> = noteIds.reduce(
          (acc, noteId) => {
            const note = { ...storage.noteMap[noteId]! }
            if (deletedFolderPathnames.includes(note.folderPathname)) {
              note.tags.forEach((tag) => {
                if (affectedTagIdAndNotesIdMap.has(tag)) {
                  affectedTagIdAndNotesIdMap.get(tag)!.push(noteId)
                } else {
                  affectedTagIdAndNotesIdMap.set(tag, [noteId])
                }
              })

              note.trashed = true
              acc[noteId] = note
            }
            return acc
          },
          {}
        )

        const modifiedTags: ObjectMap<PopulatedTagDoc> = [
          ...affectedTagIdAndNotesIdMap,
        ].reduce((acc, val) => {
          const tag = val[0]
          const noteIds = val[1]
          const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
          noteIds.forEach((noteId) => {
            newNoteIdSet.delete(noteId)
          })
          acc[tag] = {
            ...storage.tagMap[tag]!,
            noteIdSet: newNoteIdSet,
          }
          return acc
        }, {})

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            deletedFolderPathnames.forEach((aPathname) => {
              delete draft[storageId]!.folderMap[aPathname]
            })
            draft[storageId]!.noteMap = {
              ...draft[storageId]!.noteMap,
              ...modifiedNotes,
            }
            draft[storageId]!.tagMap = {
              ...draft[storageId]!.tagMap,
              ...modifiedTags,
            }
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)
      },
      [
        storageMap,
        currentPathnameWithoutNoteId,
        setStorageMap,
        queueSyncingStorage,
        router,
      ]
    )

    const createNote = useCallback(
      async (storageId: string, noteProps: Partial<NoteDocEditibleProps>) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const noteDoc = await storage.db.createNote(noteProps)

        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(noteDoc.folderPathname),
        ].filter((aPathname) => storage.folderMap[aPathname] == null)

        const parentFoldersToRefresh = await storage.db.getFoldersByPathnames(
          parentFolderPathnamesToCheck
        )

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id]),
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id,
                ]),
              }

        const modifiedTags = ((await Promise.all(
          noteDoc.tags.map(async (tag) => {
            if (storage.tagMap[tag] == null) {
              return {
                ...(await storage.db.getTag(tag)!),
                noteIdSet: new Set([noteDoc._id]),
              } as PopulatedTagDoc
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id,
                ]),
              }
            }
          })
        )) as PopulatedTagDoc[]).reduce((acc, tag) => {
          acc[tag._id.replace(TAG_ID_PREFIX, '')] = tag
          return acc
        }, {})

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap[noteDoc._id] = noteDoc
            parentFoldersToRefresh.forEach((folder) => {
              const aPathname = getFolderPathname(folder._id)
              draft[storageId]!.folderMap[aPathname] = {
                ...folder,
                pathname: aPathname,
                noteIdSet: new Set(),
              }
            })
            draft[storageId]!.folderMap[noteDoc.folderPathname] = folder
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags,
            }
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

        return noteDoc
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const updateNote = useCallback(
      async (
        storageId: string,
        noteId: string,
        noteProps: Partial<NoteDocEditibleProps>
      ) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        let previousNoteDoc = await storage.db.getNote(noteId)
        const noteDoc = await storage.db.updateNote(noteId, noteProps)
        if (noteDoc == null) {
          return
        }
        if (previousNoteDoc == null) {
          previousNoteDoc = noteDoc
        }

        const folderPathnameIsChanged =
          previousNoteDoc.folderPathname !== noteDoc.folderPathname
        const folderListToRefresh: PopulatedFolderDoc[] = []

        if (folderPathnameIsChanged) {
          const previousFolder =
            storage.folderMap[previousNoteDoc.folderPathname]
          if (previousFolder != null) {
            const newNoteIdSetForPreviousFolder = new Set(
              previousFolder.noteIdSet
            )
            newNoteIdSetForPreviousFolder.delete(noteId)
            folderListToRefresh.push({
              ...previousFolder,
              noteIdSet: newNoteIdSetForPreviousFolder,
            })
          }
        }
        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(noteDoc.folderPathname),
        ].filter((aPathname) => storage.folderMap[aPathname] == null)
        folderListToRefresh.push(
          ...(
            await storage.db.getFoldersByPathnames(parentFolderPathnamesToCheck)
          ).map((folderDoc) => {
            return {
              ...folderDoc,
              pathname: getFolderPathname(folderDoc._id),
              noteIdSet: new Set<string>(),
            }
          })
        )

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id]),
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id,
                ]),
              }
        folderListToRefresh.push(folder)

        const removedTags: ObjectMap<PopulatedTagDoc> = difference(
          storage.noteMap[noteDoc._id]!.tags,
          noteDoc.tags
        ).reduce((acc, tag) => {
          const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
          newNoteIdSet.delete(noteDoc._id)
          acc[tag] = {
            ...storage.tagMap[tag]!,
            noteIdSet: newNoteIdSet,
          }
          return acc
        }, {})

        const modifiedTags: ObjectMap<PopulatedTagDoc> = ((await Promise.all(
          noteDoc.tags.map(async (tag) => {
            if (storage.tagMap[tag] == null) {
              return {
                ...((await storage.db.getTag(tag)!) as TagDoc),
                name: tag,
                noteIdSet: new Set([noteDoc._id]),
              }
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id,
                ]),
              }
            }
          })
        )) as PopulatedTagDoc[]).reduce((acc, tag) => {
          acc[tag._id.replace(TAG_ID_PREFIX, '')] = tag
          return acc
        }, {})

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap[noteDoc._id] = noteDoc
            folderListToRefresh.forEach((folderDoc) => {
              draft[storageId]!.folderMap[folderDoc.pathname] = folderDoc
            })
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...removedTags,
              ...modifiedTags,
            }
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)
        return noteDoc
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const moveNoteToOtherStorage = useCallback(
      async (
        originalStorageId: string,
        noteId: string,
        targetStorageId: string,
        targetFolderPathname: string
      ) => {
        const originalStorage = storageMap[originalStorageId]
        const targetStorage = storageMap[targetStorageId]
        if (originalStorage == null) {
          throw new Error(
            'Original storage does not exist. Please refresh the app and try again.'
          )
        }
        if (targetStorage == null) {
          throw new Error(
            'Target storage does not exist. Please refresh the app and try again.'
          )
        }
        const originalNote = await originalStorage.db.getNote(noteId)
        if (originalNote == null) {
          throw new Error(
            'Target note does not exist. Please refresh the app and try again.'
          )
        }

        const newNote = await targetStorage.db.createNote({
          title: originalNote.title,
          content: originalNote.content,
          tags: originalNote.tags,
          data: originalNote.data,
          folderPathname: targetFolderPathname,
        })
        await originalStorage.db.purgeNote(originalNote._id)

        const modifiedTagsInOriginalStorage = originalNote.tags
          .map((tagName) => originalStorage.tagMap[tagName])
          .filter((tagDoc) => tagDoc != null)
          .map((tagDoc) => {
            const newNoteIdSet = new Set(tagDoc!.noteIdSet)
            newNoteIdSet.delete(originalNote._id)
            return {
              ...tagDoc!,
              noteIdSet: newNoteIdSet,
            }
          })
        let modifiedFolderInOriginalStorage =
          originalStorage.folderMap[originalNote.folderPathname]
        if (modifiedFolderInOriginalStorage != null) {
          const newNoteIdSet = new Set(
            modifiedFolderInOriginalStorage.noteIdSet
          )
          newNoteIdSet.delete(originalNote._id)
          modifiedFolderInOriginalStorage = {
            ...modifiedFolderInOriginalStorage,
            noteIdSet: newNoteIdSet,
          }
        }

        const modifiedFoldersInTargetStorage: PopulatedFolderDoc[] = []
        const targetFolder =
          targetStorage.folderMap[targetFolderPathname] == null
            ? {
                ...(await targetStorage.db.getFolder(targetFolderPathname))!,
                noteIdSet: new Set<string>(),
                pathname: targetFolderPathname,
              }
            : targetStorage.folderMap[targetFolderPathname]!
        const newNoteIdSetForTargetFolder = new Set([
          ...targetFolder.noteIdSet,
          newNote._id,
        ])
        modifiedFoldersInTargetStorage.push({
          ...targetFolder,
          noteIdSet: newNoteIdSetForTargetFolder,
        })

        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(targetFolderPathname),
        ].filter((aPathname) => targetStorage.folderMap[aPathname] == null)
        const parentFoldersToRefresh = await targetStorage.db.getFoldersByPathnames(
          parentFolderPathnamesToCheck
        )
        modifiedFoldersInTargetStorage.push(
          ...parentFoldersToRefresh.map((folderDoc) => {
            return {
              ...folderDoc,
              pathname: getFolderPathname(folderDoc._id),
              noteIdSet: new Set<string>(),
            }
          })
        )

        const modifiedTagsInTargetStorage = await Promise.all(
          newNote.tags.map(async (tagName) => {
            const tagDoc = targetStorage.tagMap[tagName]
            if (tagDoc == null) {
              return {
                ...(await targetStorage.db.getTag(tagName))!,
                name: tagName,
                noteIdSet: new Set([newNote._id]),
              }
            }
            return {
              ...tagDoc,
              noteIdSet: new Set([...tagDoc.noteIdSet, newNote._id]),
            }
          })
        )

        const modifiedNoteMapOfOriginalStorage = {
          ...originalStorage.noteMap,
        }
        delete modifiedNoteMapOfOriginalStorage[originalNote._id]

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[originalStorageId]!.noteMap = modifiedNoteMapOfOriginalStorage
            if (modifiedFolderInOriginalStorage != null) {
              draft[originalStorageId]!.folderMap[
                modifiedFolderInOriginalStorage.pathname
              ] = modifiedFolderInOriginalStorage
            }
            modifiedTagsInOriginalStorage.forEach((tagDoc) => {
              draft[originalStorageId]!.tagMap[tagDoc.name] = tagDoc
            })

            draft[targetStorageId]!.noteMap[newNote._id] = newNote
            modifiedFoldersInTargetStorage.forEach((folderDoc) => {
              draft[targetStorageId]!.folderMap[folderDoc.pathname] = folderDoc
            })
            modifiedTagsInTargetStorage.forEach((tagDoc) => {
              draft[targetStorageId]!.tagMap[tagDoc.name] = tagDoc
            })
          })
        )

        queueSyncingStorage(originalStorageId, autoSyncDebounceWaitingTime)
        if (originalStorageId !== targetStorageId) {
          queueSyncingStorage(targetStorageId, autoSyncDebounceWaitingTime)
        }
      },
      [queueSyncingStorage, setStorageMap, storageMap]
    )

    const trashNote = useCallback(
      async (storageId: string, noteId: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const noteDoc = await storage.db.trashNote(noteId)
        if (noteDoc == null) {
          return
        }

        let folder: PopulatedFolderDoc | undefined
        if (storage.folderMap[noteDoc.folderPathname] != null) {
          const newFolderNoteIdSet = new Set(
            storage.folderMap[noteDoc.folderPathname]!.noteIdSet
          )
          newFolderNoteIdSet.delete(noteDoc._id)
          folder = {
            ...storage.folderMap[noteDoc.folderPathname]!,
            noteIdSet: newFolderNoteIdSet,
          }
        }

        const modifiedTags: ObjectMap<PopulatedTagDoc> = noteDoc.tags.reduce(
          (acc, tag) => {
            if (storage.tagMap[tag] == null) {
              return acc
            }
            const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
            newNoteIdSet.delete(noteDoc._id)
            acc[tag] = {
              ...storage.tagMap[tag]!,
              noteIdSet: newNoteIdSet,
            }
            return acc
          },
          {}
        )

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap[noteDoc._id] = noteDoc
            draft[storageId]!.folderMap[noteDoc.folderPathname] = folder
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags,
            }
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

        return noteDoc
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const untrashNote = useCallback(
      async (storageId: string, noteId: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const noteDoc = await storage.db.untrashNote(noteId)

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id]),
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id,
                ]),
              }
        const parentFolderPathnames = getAllParentFolderPathnames(
          noteDoc.folderPathname
        )
        const missingFolders: PopulatedFolderDoc[] = []
        for (const parentFolderPathname of parentFolderPathnames) {
          if (storage.folderMap[parentFolderPathname] == null) {
            missingFolders.push({
              ...(await storage.db.getFolder(parentFolderPathname)),
              pathname: parentFolderPathname,
              noteIdSet: new Set(),
            } as PopulatedFolderDoc)
          }
        }

        const modifiedTags: ObjectMap<PopulatedTagDoc> = ((await Promise.all(
          noteDoc.tags.map(async (tag) => {
            if (storage.tagMap[tag] == null) {
              return {
                ...(await storage.db.getTag(tag)!),
                noteIdSet: new Set([noteDoc._id]),
              } as PopulatedTagDoc
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id,
                ]),
              }
            }
          })
        )) as PopulatedTagDoc[]).reduce((acc, tag) => {
          acc[tag._id.replace(TAG_ID_PREFIX, '')] = tag
          return acc
        }, {})

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap[noteDoc._id] = noteDoc
            draft[storageId]!.folderMap[noteDoc.folderPathname] = folder
            missingFolders.forEach((missingFolder) => {
              draft[storageId]!.folderMap[
                missingFolder.pathname
              ] = missingFolder
            })
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags,
            }
          })
        )

        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

        return noteDoc
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const purgeNote = useCallback(
      async (storageId: string, noteId: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }

        await storage.db.purgeNote(noteId)

        const noteDoc = storageMap[storageId]!.noteMap[noteId]!

        const noteMap = { ...storageMap[storageId]!.noteMap }
        delete noteMap[noteId]

        const newFolderNoteIdSet = new Set(
          storage.folderMap[noteDoc.folderPathname]!.noteIdSet
        )
        newFolderNoteIdSet.delete(noteDoc._id)
        const folder: PopulatedFolderDoc = {
          ...storage.folderMap[noteDoc.folderPathname]!,
          noteIdSet: newFolderNoteIdSet,
        }

        const modifiedTags: ObjectMap<PopulatedTagDoc> = noteDoc.tags.reduce(
          (acc, tag) => {
            const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
            newNoteIdSet.delete(noteDoc._id)
            acc[tag] = {
              ...storage.tagMap[tag]!,
              noteIdSet: newNoteIdSet,
            }
            return acc
          },
          {}
        )

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap = noteMap
            draft[storageId]!.folderMap[noteDoc.folderPathname] = folder
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags,
            }
          })
        )
        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

        return
      },
      [storageMap, setStorageMap, queueSyncingStorage]
    )

    const removeTag = useCallback(
      async (storageId: string, tag: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }

        await storage.db.removeTag(tag)

        if (
          currentPathnameWithoutNoteId ===
          `/app/storages/${storageId}/tags/${tag}`
        ) {
          router.replace(`/app/storages/${storageId}/notes`)
        }

        const modifiedNotes: ObjectMap<NoteDoc> = Object.keys(
          storageMap[storageId]!.noteMap
        ).reduce((acc, noteId) => {
          if (storageMap[storageId]!.noteMap[noteId]!.tags.includes(tag)) {
            acc[noteId] = {
              ...storageMap[storageId]!.noteMap[noteId]!,
              tags: storageMap[storageId]!.noteMap[noteId]!.tags.filter(
                (noteTag) => noteTag !== tag
              ),
            }
          }
          return acc
        }, {})

        const newTagMap = { ...storageMap[storageId]!.tagMap }
        delete newTagMap[tag]

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            draft[storageId]!.noteMap = {
              ...draft[storageId]!.noteMap,
              ...modifiedNotes,
            }
            draft[storageId]!.tagMap = newTagMap
          })
        )
        queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

        return
      },
      [
        storageMap,
        currentPathnameWithoutNoteId,
        setStorageMap,
        queueSyncingStorage,
        router,
      ]
    )

    const addAttachments = async (
      storageId: string,
      files: File[]
    ): Promise<Attachment[]> => {
      const storage = storageMap[storageId]
      if (storage == null) {
        return []
      }
      const attachments = await storage.db.upsertAttachments(files)

      setStorageMap(
        produce((draft: ObjectMap<NoteStorage>) => {
          attachments.forEach((attachment) => {
            draft[storageId]!.attachmentMap[attachment.name] = attachment
          })
        })
      )

      queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)

      return attachments
    }

    const removeAttachment = async (storageId: string, fileName: string) => {
      const storage = storageMap[storageId]
      if (storage == null) {
        return
      }
      await storage.db.removeAttachment(fileName)

      setStorageMap(
        produce((draft: ObjectMap<NoteStorage>) => {
          delete draft[storageId]!.attachmentMap[fileName]
        })
      )

      queueSyncingStorage(storageId, autoSyncDebounceWaitingTime)
    }

    return {
      initialized,
      storageMap,
      initialize,
      createStorage,
      removeStorage,
      renameStorage,
      renameCloudStorage,
      linkStorage,
      unlinkStorage,
      syncStorage,
      queueSyncingStorage,
      queueSyncingAllStorage,
      cancelSyncingStorageQueue,
      createFolder,
      renameFolder,
      removeFolder,
      createNote,
      updateNote,
      trashNote,
      untrashNote,
      purgeNote,
      moveNoteToOtherStorage,
      removeTag,
      addAttachments,
      removeAttachment,
    }
  }
}

const storageDataPredicate = schema({
  id: ow.string,
  name: ow.string,
})

export function getStorageDataList(
  liteStorage: LiteStorage
): PouchNoteStorageData[] | null {
  const serializedStorageDataList = liteStorage.getItem(storageDataListKey)
  try {
    const parsedStorageDataList = JSON.parse(serializedStorageDataList || '[]')
    if (!Array.isArray(parsedStorageDataList))
      throw new Error('storage data is corrupted')

    return parsedStorageDataList.reduce<PouchNoteStorageData[]>(
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
      values(storageMap).map((storage) => {
        const { id, name } = storage
        if (storage.type === 'fs') {
          return {
            id,
            name,
            type: 'fs',
            location: storage.location,
          }
        }
        return {
          id,
          name,
          cloudStorage: storage.cloudStorage,
        }
      })
    )
  )
}

async function prepareStorage(
  storageData: NoteStorageData
): Promise<NoteStorage> {
  const { id, name } = storageData
  const db =
    storageData.type === 'fs'
      ? new FSNoteDb(id, name, storageData.location)
      : new PouchNoteDb(new PouchDB(id, { adapter: 'idb' }), id, name)
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
      map[name] = { ...tagDoc, name, noteIdSet: new Set() }
      return map
    },
    {}
  )

  for (const noteDoc of values(noteMap)) {
    if (noteDoc.trashed) {
      continue
    }
    populatedFolderMap[noteDoc.folderPathname]!.noteIdSet.add(noteDoc._id)
    noteDoc.tags.forEach((tag) => {
      populatedTagMap[tag]!.noteIdSet.add(noteDoc._id)
    })
  }

  if (storageData.type === 'fs') {
    return {
      type: 'fs',
      id,
      name,
      location: storageData.location,
      noteMap,
      folderMap: populatedFolderMap,
      tagMap: populatedTagMap,
      attachmentMap,
      db: db as any,
    } as FSNoteStorage
  }

  return {
    type: storageData.type,
    id,
    name,
    cloudStorage: storageData.cloudStorage,
    noteMap,
    folderMap: populatedFolderMap,
    tagMap: populatedTagMap,
    attachmentMap,
    db,
  } as PouchNoteStorage
}

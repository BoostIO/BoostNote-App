import {
  NoteStorage,
  NoteStorageData,
  ObjectMap,
  NoteDoc,
  NoteDocEditibleProps,
  PopulatedFolderDoc,
  PopulatedTagDoc,
  Attachment,
  PopulatedNoteDoc
} from './types'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createStoreContext } from '../utils/context'
import ow from 'ow'
import { schema, isValid, optional } from '../utils/predicates'
import NoteDb from './NoteDb'
import {
  getFolderPathname,
  getParentFolderPathname,
  getAllParentFolderPathnames,
  isFolderPathnameValid,
  createUnprocessableEntityError,
  isCloudStorageData,
  entries
} from './utils'
import { generateId } from '../string'
import PouchDB from './PouchDB'
import { LiteStorage, localLiteStorage } from 'ltstrg'
import { produce } from 'immer'
import { useRouter, usePathnameWithoutNoteId } from '../router'
import { values } from '../db/utils'
import { storageDataListKey } from '../localStorageKeys'
import { TAG_ID_PREFIX } from './consts'
import { difference } from 'ramda'
import { escapeRegExp } from '../regex'
import {
  User,
  createStorage as createCloudStorage,
  deleteStorage as deleteCloudStorage,
  renameStorage as renameCloudStorage,
  getStorages
} from '../accounts'
import { wrapDbStoreWithAnalytics } from '../analytics'
import { useToast } from '../toast'

export interface DbStore {
  initialized: boolean
  storageMap: ObjectMap<NoteStorage>
  initialize: (user?: User) => Promise<void>
  createStorage: (
    name: string,
    type?: 'local' | 'cloud'
  ) => Promise<NoteStorage>
  removeStorage: (id: string) => Promise<void>
  renameStorage: (id: string, name: string) => Promise<void>
  syncStorage: (id: string, user: User) => Promise<void>
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
  adapter: 'idb' | 'memory'
) {
  return (): DbStore => {
    const router = useRouter()
    const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()
    const [initialized, setInitialized] = useState(false)
    const [storageMap, setStorageMap] = useState<ObjectMap<NoteStorage>>({})
    const activeUser = useRef<User | undefined>(undefined)

    const synced = useRef<Set<string>>(new Set())
    useEffect(() => {
      entries(storageMap).forEach(([, storage]) => {
        if (storage.cloudStorage == null || synced.current.has(storage.id)) {
          return
        }
        synced.current.add(storage.id)
        syncStorage(storage.id)
      })
    }, [storageMap])

    const initialize = useCallback(async (user?: User) => {
      const storageDataList = getStorageDataListOrFix(liteStorage)
      activeUser.current = user

      const [local, cloud] = storageDataList.reduce<
        [NoteStorageData[], Required<NoteStorageData>[]]
      >(
        ([local, cloud], storage) => {
          if (isCloudStorageData(storage)) {
            cloud.push(storage)
          } else {
            local.push(storage)
          }
          return [local, cloud]
        },
        [[], []]
      )

      const prepared = await Promise.all(
        local.map(storage => prepareStorage(storage, adapter))
      )
      const storageMap = prepared.reduce(
        (map, storage) => {
          ;(map[storage.id] = storage), adapter
          return map
        },
        {} as ObjectMap<NoteStorage>
      )

      saveStorageDataList(liteStorage, storageMap)
      setStorageMap(storageMap)
      setInitialized(true)

      if (activeUser.current == null) {
        return
      }

      const inCloudStorages = await getStorages(activeUser.current)

      const cloudStorageMap = new Map(
        cloud.map(storage => [storage.cloudStorage.id, storage])
      )
      const userCloudStorage = await Promise.all(
        inCloudStorages.map(storage => {
          const current = cloudStorageMap.get(storage.id)
          const id = current ? current.id : generateId()
          cloudStorageMap.delete(storage.id)
          const storageData = {
            id,
            name: storage.name,
            cloudStorage: {
              id: storage.id,
              size: storage.size,
              updatedAt: Date.now()
            }
          }
          return prepareStorage(storageData, adapter)
        })
      )

      let newStorageMap: ObjectMap<NoteStorage> = {}
      setStorageMap(prevStorageMap => {
        newStorageMap = produce(prevStorageMap, draft => {
          userCloudStorage.forEach(storage => {
            draft[storage.id] = storage
          })
        })
        return newStorageMap
      })

      saveStorageDataList(liteStorage, newStorageMap)

      Array.from(cloudStorageMap).forEach(([, storage]) => {
        new PouchDB(storage.id, { adapter }).destroy()
      })
    }, [])

    const createStorage = useCallback(
      async (name: string, type: 'local' | 'cloud' = 'local') => {
        const id = generateId()

        const storageData: NoteStorageData = { id, name }

        if (type === 'cloud') {
          if (activeUser.current == null) {
            throw new Error('NotLoggedIn')
          }

          const result = await createCloudStorage(name, activeUser.current)
          if (result === 'SubscriptionRequired') {
            throw new Error(result)
          }
          storageData.cloudStorage = {
            id: result.id,
            size: 0,
            updatedAt: Date.now()
          }
        }

        const storage = await prepareStorage(storageData, adapter)

        let newStorageMap: ObjectMap<NoteStorage>
        setStorageMap(prevStorageMap => {
          newStorageMap = produce(prevStorageMap, draft => {
            draft[id] = storage
          })

          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap!)
        return storage
      },
      [activeUser]
    )

    const removeStorage = useCallback(
      async (id: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }

        if (activeUser.current != null && storage.cloudStorage != null) {
          await deleteCloudStorage(activeUser.current, storage.cloudStorage.id)
        }

        await storage.db.pouchDb.destroy()
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

    const renameStorage = useCallback(
      async (id: string, name: string) => {
        const storageData = storageMap[id]
        if (
          storageData != null &&
          storageData.cloudStorage != null &&
          activeUser.current != null
        ) {
          await renameCloudStorage(
            activeUser.current,
            storageData.cloudStorage.id,
            name
          )
        }

        let newStorageMap: ObjectMap<NoteStorage> = {}
        setStorageMap(prevStorageMap => {
          newStorageMap = produce(prevStorageMap, draft => {
            if (draft[id] != null) {
              draft[id]!.name = name
            }
          })
          return newStorageMap
        })

        saveStorageDataList(liteStorage, newStorageMap)
      },
      [storageMap]
    )

    const { pushMessage } = useToast()

    const createFolder = useCallback(
      async (id: string, pathname: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }
        let folder
        try {
          folder = await storage.db.upsertFolder(pathname)
        } catch (error) {
          pushMessage({
            title: 'Error',
            description: 'Folder name is invalid.'
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
            createdFolders.forEach(aFolder => {
              const aPathname = getFolderPathname(aFolder._id)
              if (storage.folderMap[aPathname] == null) {
                draft[id]!.folderMap[aPathname] = {
                  ...aFolder,
                  pathname: aPathname,
                  noteIdSet: new Set()
                }
              }
            })
          })
        )
      },
      [storageMap]
    )

    const renameFolder = useCallback(
      async (id: string, pathname: string, newPathname: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }
        if (!isFolderPathnameValid(pathname)) {
          throw createUnprocessableEntityError(
            `pathname is invalid, got \`${pathname}\``
          )
        }
        if (!isFolderPathnameValid(newPathname)) {
          throw createUnprocessableEntityError(
            `pathname is invalid, got \`${newPathname}\``
          )
        }

        const folderListToRefresh: PopulatedFolderDoc[] = []
        const notesListToRefresh: NoteDoc[] = []

        const subFolders = Object.keys(storage.folderMap).filter(aPathname =>
          aPathname.startsWith(`${pathname}/`)
        )
        const allFoldersToRename = [pathname, ...subFolders]
        await Promise.all(
          allFoldersToRename.map(async folderPathname => {
            const regex = new RegExp(`^${escapeRegExp(pathname)}`, 'g')
            const newfolderPathname = folderPathname.replace(regex, newPathname)
            const folder = await storage.db.getFolder(folderPathname)
            if (folder == null) {
              throw createUnprocessableEntityError(
                `this folder does not exist \`${folderPathname}\``
              )
            }
            if ((await storage.db.getFolder(newfolderPathname)) != null) {
              throw createUnprocessableEntityError(
                `this folder already exists \`${newfolderPathname}\``
              )
            }
            if (
              folderPathname.split('/').length !==
              newfolderPathname.split('/').length
            ) {
              throw createUnprocessableEntityError(
                `New name is invalid. \`${newfolderPathname}\``
              )
            }
            const notes = await storage.db.findNotesByFolder(folderPathname)
            const newFolder = await storage.db.upsertFolder(newfolderPathname)
            const rewrittenNotes = await Promise.all(
              notes.map(note =>
                storage.db.updateNote(note._id, {
                  folderPathname: newfolderPathname
                })
              )
            )

            folderListToRefresh.push({
              ...newFolder,
              pathname: getFolderPathname(newFolder._id),
              noteIdSet: new Set(rewrittenNotes.map(note => note._id))
            })
            notesListToRefresh.push(...rewrittenNotes)
          })
        )

        await storage.db.removeFolder(pathname)

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            notesListToRefresh.forEach(noteDoc => {
              draft[storage.id]!.noteMap[noteDoc._id] = {
                storageId: storage.id,
                ...noteDoc
              } as PopulatedNoteDoc
            })
            folderListToRefresh.forEach(folderDoc => {
              draft[storage.id]!.folderMap[folderDoc.pathname] = folderDoc
            })
            allFoldersToRename.forEach(aPathname => {
              delete draft[id]!.folderMap[aPathname]
            })
          })
        )
      },
      [storageMap]
    )

    const removeFolder = useCallback(
      async (id: string, pathname: string) => {
        const storage = storageMap[id]
        if (storage == null) {
          return
        }
        await storage.db.removeFolder(pathname)
        if (
          `${currentPathnameWithoutNoteId}/`.startsWith(
            `/app/storages/${id}/notes${pathname}/`
          )
        ) {
          router.replace(
            `/app/storages/${id}/notes${getParentFolderPathname(pathname)}`
          )
        }

        const deletedFolderPathnames = [
          pathname,
          ...Object.keys(storage.folderMap).filter(aPathname =>
            aPathname.startsWith(`${pathname}/`)
          )
        ]

        const noteIds = Object.keys(storage.noteMap)
        const affectedTagIdAndNotesIdMap = new Map<string, string[]>()
        const modifiedNotes: ObjectMap<PopulatedNoteDoc> = noteIds.reduce(
          (acc, noteId) => {
            const note = { ...storage.noteMap[noteId]! }
            if (deletedFolderPathnames.includes(note.folderPathname)) {
              note.tags.forEach(tag => {
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
          ...affectedTagIdAndNotesIdMap
        ].reduce((acc, val) => {
          const tag = val[0]
          const noteIds = val[1]
          const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
          noteIds.forEach(noteId => {
            newNoteIdSet.delete(noteId)
          })
          acc[tag] = {
            ...storage.tagMap[tag]!,
            noteIdSet: newNoteIdSet
          }
          return acc
        }, {})

        setStorageMap(
          produce((draft: ObjectMap<NoteStorage>) => {
            deletedFolderPathnames.forEach(aPathname => {
              delete draft[id]!.folderMap[aPathname]
            })
            draft[id]!.noteMap = {
              ...draft[id]!.noteMap,
              ...modifiedNotes
            }
            draft[id]!.tagMap = {
              ...draft[id]!.tagMap,
              ...modifiedTags
            }
          })
        )
      },
      [storageMap, router, currentPathnameWithoutNoteId]
    )

    const createNote = useCallback(
      async (storageId: string, noteProps: Partial<NoteDocEditibleProps>) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const noteDoc = {
          storageId,
          ...(await storage.db.createNote(noteProps))
        } as PopulatedNoteDoc

        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(noteDoc.folderPathname)
        ].filter(aPathname => storage.folderMap[aPathname] == null)

        const parentFoldersToRefresh = await storage.db.getFoldersByPathnames(
          parentFolderPathnamesToCheck
        )

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id
                ])
              }

        const modifiedTags = ((await Promise.all(
          noteDoc.tags.map(async tag => {
            if (storage.tagMap[tag] == null) {
              return {
                ...(await storage.db.getTag(tag)!),
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedTagDoc
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id
                ])
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
            parentFoldersToRefresh.forEach(folder => {
              const aPathname = getFolderPathname(folder._id)
              draft[storageId]!.folderMap[aPathname] = {
                ...folder,
                pathname: aPathname,
                noteIdSet: new Set()
              }
            })
            draft[storageId]!.folderMap[noteDoc.folderPathname] = folder
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags
            }
          })
        )
        return noteDoc
      },
      [storageMap]
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
        const updatedNoteDoc = await storage.db.updateNote(noteId, noteProps)
        if (updatedNoteDoc == null) {
          return
        }
        const noteDoc = { storageId, ...updatedNoteDoc } as PopulatedNoteDoc
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
              noteIdSet: newNoteIdSetForPreviousFolder
            })
          }
        }
        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(noteDoc.folderPathname)
        ].filter(aPathname => storage.folderMap[aPathname] == null)
        folderListToRefresh.push(
          ...(await storage.db.getFoldersByPathnames(
            parentFolderPathnamesToCheck
          )).map(folderDoc => {
            return {
              ...folderDoc,
              pathname: getFolderPathname(folderDoc._id),
              noteIdSet: new Set<string>()
            }
          })
        )

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id
                ])
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
            noteIdSet: newNoteIdSet
          }
          return acc
        }, {})

        const modifiedTags: ObjectMap<PopulatedTagDoc> = ((await Promise.all(
          noteDoc.tags.map(async tag => {
            if (storage.tagMap[tag] == null) {
              return {
                ...(await storage.db.getTag(tag)!),
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedTagDoc
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id
                ])
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
            folderListToRefresh.forEach(folderDoc => {
              draft[storageId]!.folderMap[folderDoc.pathname] = folderDoc
            })
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...removedTags,
              ...modifiedTags
            }
          })
        )

        return noteDoc
      },
      [storageMap]
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

        const newNote = {
          storageId: targetStorage.id,
          ...(await targetStorage.db.createNote({
            title: originalNote.title,
            content: originalNote.content,
            tags: originalNote.tags,
            data: originalNote.data,
            folderPathname: targetFolderPathname
          }))
        } as PopulatedNoteDoc
        await originalStorage.db.purgeNote(originalNote._id)

        const modifiedTagsInOriginalStorage = originalNote.tags
          .map(tagName => originalStorage.tagMap[tagName])
          .filter(tagDoc => tagDoc != null)
          .map(tagDoc => {
            const newNoteIdSet = new Set(tagDoc!.noteIdSet)
            newNoteIdSet.delete(originalNote._id)
            return {
              ...tagDoc!,
              noteIdSet: newNoteIdSet
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
            noteIdSet: newNoteIdSet
          }
        }

        const modifiedFoldersInTargetStorage: PopulatedFolderDoc[] = []
        const targetFolder =
          targetStorage.folderMap[targetFolderPathname] == null
            ? {
                ...(await targetStorage.db.getFolder(targetFolderPathname))!,
                noteIdSet: new Set<string>(),
                pathname: targetFolderPathname
              }
            : targetStorage.folderMap[targetFolderPathname]!
        const newNoteIdSetForTargetFolder = new Set([
          ...targetFolder.noteIdSet,
          newNote._id
        ])
        modifiedFoldersInTargetStorage.push({
          ...targetFolder,
          noteIdSet: newNoteIdSetForTargetFolder
        })

        const parentFolderPathnamesToCheck = [
          ...getAllParentFolderPathnames(targetFolderPathname)
        ].filter(aPathname => targetStorage.folderMap[aPathname] == null)
        const parentFoldersToRefresh = await targetStorage.db.getFoldersByPathnames(
          parentFolderPathnamesToCheck
        )
        modifiedFoldersInTargetStorage.push(
          ...parentFoldersToRefresh.map(folderDoc => {
            return {
              ...folderDoc,
              pathname: getFolderPathname(folderDoc._id),
              noteIdSet: new Set<string>()
            }
          })
        )

        const modifiedTagsInTargetStorage = await Promise.all(
          newNote.tags.map(async tagName => {
            const tagDoc = targetStorage.tagMap[tagName]
            if (tagDoc == null) {
              return {
                ...(await targetStorage.db.getTag(tagName))!,
                name: tagName,
                noteIdSet: new Set([newNote._id])
              }
            }
            return {
              ...tagDoc,
              noteIdSet: new Set([...tagDoc.noteIdSet, newNote._id])
            }
          })
        )

        const modifiedNoteMapOfOriginalStorage = {
          ...originalStorage.noteMap
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
            modifiedTagsInOriginalStorage.forEach(tagDoc => {
              draft[originalStorageId]!.tagMap[tagDoc.name] = tagDoc
            })

            draft[targetStorageId]!.noteMap[newNote._id] = newNote
            modifiedFoldersInTargetStorage.forEach(folderDoc => {
              draft[targetStorageId]!.folderMap[folderDoc.pathname] = folderDoc
            })
            modifiedTagsInTargetStorage.forEach(tagDoc => {
              draft[targetStorageId]!.tagMap[tagDoc.name] = tagDoc
            })
          })
        )
      },
      [storageMap]
    )

    const trashNote = useCallback(
      async (storageId: string, noteId: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const updatedNoteDoc = await storage.db.trashNote(noteId)
        if (updatedNoteDoc == null) {
          return
        }
        const noteDoc = { storageId, ...updatedNoteDoc } as PopulatedNoteDoc

        let folder: PopulatedFolderDoc | undefined
        if (storage.folderMap[noteDoc.folderPathname] != null) {
          const newFolderNoteIdSet = new Set(
            storage.folderMap[noteDoc.folderPathname]!.noteIdSet
          )
          newFolderNoteIdSet.delete(noteDoc._id)
          folder = {
            ...storage.folderMap[noteDoc.folderPathname]!,
            noteIdSet: newFolderNoteIdSet
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
              noteIdSet: newNoteIdSet
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
              ...modifiedTags
            }
          })
        )

        return noteDoc
      },
      [storageMap]
    )

    const untrashNote = useCallback(
      async (storageId: string, noteId: string) => {
        const storage = storageMap[storageId]
        if (storage == null) {
          return
        }
        const noteDoc = {
          storageId,
          ...(await storage.db.untrashNote(noteId))
        } as PopulatedNoteDoc

        const folder: PopulatedFolderDoc =
          storage.folderMap[noteDoc.folderPathname] == null
            ? ({
                ...(await storage.db.getFolder(noteDoc.folderPathname)!),
                pathname: noteDoc.folderPathname,
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedFolderDoc)
            : {
                ...storage.folderMap[noteDoc.folderPathname]!,
                noteIdSet: new Set([
                  ...storage.folderMap[noteDoc.folderPathname]!.noteIdSet,
                  noteDoc._id
                ])
              }

        const modifiedTags: ObjectMap<PopulatedTagDoc> = ((await Promise.all(
          noteDoc.tags.map(async tag => {
            if (storage.tagMap[tag] == null) {
              return {
                ...(await storage.db.getTag(tag)!),
                noteIdSet: new Set([noteDoc._id])
              } as PopulatedTagDoc
            } else {
              return {
                ...storage.tagMap[tag]!,
                noteIdSet: new Set([
                  ...storage.tagMap[tag]!.noteIdSet.values(),
                  noteDoc._id
                ])
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
            draft[storageId]!.tagMap = {
              ...storage.tagMap,
              ...modifiedTags
            }
          })
        )

        return noteDoc
      },
      [storageMap]
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
          noteIdSet: newFolderNoteIdSet
        }

        const modifiedTags: ObjectMap<PopulatedTagDoc> = noteDoc.tags.reduce(
          (acc, tag) => {
            const newNoteIdSet = new Set(storage.tagMap[tag]!.noteIdSet)
            newNoteIdSet.delete(noteDoc._id)
            acc[tag] = {
              ...storage.tagMap[tag]!,
              noteIdSet: newNoteIdSet
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
              ...modifiedTags
            }
          })
        )

        return
      },
      [storageMap]
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

        const modifiedNotes: ObjectMap<PopulatedNoteDoc> = Object.keys(
          storageMap[storageId]!.noteMap
        ).reduce((acc, noteId) => {
          if (storageMap[storageId]!.noteMap[noteId]!.tags.includes(tag)) {
            acc[noteId] = {
              ...storageMap[storageId]!.noteMap[noteId]!,
              tags: storageMap[storageId]!.noteMap[noteId]!.tags.filter(
                noteTag => noteTag !== tag
              )
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
              ...modifiedNotes
            }
            draft[storageId]!.tagMap = newTagMap
          })
        )

        return
      },
      [storageMap, currentPathnameWithoutNoteId, router]
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
          attachments.forEach(attachment => {
            draft[storageId]!.attachmentMap[attachment.name] = attachment
          })
        })
      )

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
    }

    const syncStorage = async (storageId: string) => {
      if (activeUser.current == null) {
        return
      }

      let storage = storageMap[storageId]
      if (storage == null || storage.cloudStorage == null) {
        return
      }
      await storage.db.sync(activeUser.current, storage.cloudStorage)
      storage.cloudStorage.updatedAt = Date.now()

      storage = await prepareStorage(storage, adapter)
      setStorageMap(
        produce(draft => {
          if (draft[storageId] == null) {
            return
          }
          draft[storageId] = storage
        })
      )
    }

    return {
      initialized,
      storageMap,
      initialize,
      createStorage,
      removeStorage,
      renameStorage,
      syncStorage,
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
      removeAttachment
    }
  }
}

const storageDataPredicate = schema({
  id: ow.string,
  name: ow.string,
  cloudStorage: optional({
    id: ow.number,
    size: ow.number,
    updatedAt: ow.number
  })
})

export const {
  StoreProvider: DbProvider,
  useStore: useDb
} = createStoreContext(
  wrapDbStoreWithAnalytics(createDbStoreCreator(localLiteStorage, 'idb'))
)

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
      values(storageMap).map(({ id, name, cloudStorage }) => ({
        id,
        name,
        cloudStorage
      }))
    )
  )
}

async function prepareStorage(
  { id, name, cloudStorage }: NoteStorageData,
  adapter: 'idb' | 'memory'
): Promise<NoteStorage> {
  const pouchdb = new PouchDB(id, { adapter })
  const db = new NoteDb(pouchdb, id, name)
  await db.init()

  const { noteMap, folderMap, tagMap } = await db.getAllDocsMap()
  const attachmentMap = await db.getAttachmentMap()
  const storage: NoteStorage = {
    id,
    name,
    cloudStorage,
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
    attachmentMap,
    db
  }

  for (const noteDoc of Object.values(noteMap) as NoteDoc[]) {
    if (noteDoc.trashed) {
      continue
    }
    storage.folderMap[noteDoc.folderPathname]!.noteIdSet.add(noteDoc._id)
    noteDoc.tags.forEach(tagName => {
      storage.tagMap[tagName]!.noteIdSet.add(noteDoc._id)
    })
  }

  return storage
}

import { useCallback } from 'react'
import shortid from 'shortid'
import { useDb } from '../../../db'
import { useRouter } from '../../../router'
import {
  FolderDoc,
  NoteDoc,
  NoteDocEditibleProps,
  NoteStorage,
} from '../../../db/types'
import useBulkApi from '../../../../shared/lib/hooks/useBulkApi'
import { getFolderHref, getDocHref, getWorkspaceHref } from '../../../db/utils'
import { join } from 'path'

export function useLocalDB() {
  // const { pageDoc, pageFolder, setPartialPageData } = usePage()
  // const {
  //   updateWorkspacesMap,
  //   updateFoldersMap,
  //   updateDocsMap,
  //   updateParentFolderOfDoc,
  //   removeFromWorkspacesMap,
  //   foldersMap,
  //   docsMap,
  //   removeFromDocsMap,
  //   removeFromFoldersMap,
  //   setCurrentPath,
  // } = useNav()
  const {
    createStorage,
    createNote,
    removeStorage,
    createFolder,
    removeFolder,
    trashNote,
    untrashNote,
    purgeNote: deleteNote,
    bookmarkNote,
    unbookmarkNote,
    updateNote,
    renameFolder,
    storageMap: workspaceMap,
  } = useDb()
  const { push } = useRouter()

  const { sendingMap, send } = useBulkApi()

  const createWorkspaceApi = useCallback(
    async (
      body: CreateStorageRequestBody,
      options: {
        skipRedirect?: boolean
        afterSuccess?: (workspace: NoteStorage) => void
      }
    ) => {
      await send(shortid.generate(), 'create', {
        api: () => createStorage(body.name, body.props),
        cb: (workspace: NoteStorage) => {
          if (workspace != null) {
            if (!options.skipRedirect) {
              push(getWorkspaceHref(workspace))
            }
            if (options.afterSuccess != null) {
              options.afterSuccess(workspace)
            }
          }
        },
      })
    },
    [createStorage, push, send]
  )

  const createDocApi = useCallback(
    async (body: CreateNoteRequestBody, afterSuccess?: () => void) => {
      await send(shortid.generate(), 'create', {
        api: () => createNote(body.workspaceId, body.docProps),
        cb: (doc: NoteDoc) => {
          if (doc != null) {
            push(getDocHref(doc, body.workspaceId))
            if (afterSuccess != null) {
              afterSuccess()
            }
          }
        },
      })
    },
    [createNote, push, send]
  )

  const createFolderApi = useCallback(
    async (body: CreateFolderRequestBody, afterSuccess?: () => void) => {
      await send(shortid.generate(), 'create', {
        api: () => {
          let folderName = body.folderName
          if (folderName.endsWith('/')) {
            folderName = folderName.slice(0, folderName.length - 1)
          }
          const folderPathname = join(body.destinationPathname, folderName)
          console.log('got ', body, folderPathname)
          return createFolder(body.workspaceId, folderPathname)
        },
        cb: (folder: FolderDoc) => {
          console.log('Created folder', folder)
          if (folder != null) {
            push(getFolderHref(folder, body.workspaceId))
            if (afterSuccess != null) {
              afterSuccess()
            }
          }
        },
      })
    },
    [createFolder, push, send]
  )

  const toggleDocArchived = useCallback(
    async (workspaceId: string, docId: string, trashed: boolean) => {
      await send(docId, 'archive', {
        api: () => {
          if (trashed) {
            return untrashNote(workspaceId, docId)
          } else {
            return trashNote(workspaceId, docId)
          }
        },
        cb: (res) => {
          console.log('Archived doc...', res)
          // updateDocsMap([res.doc.id, res.doc])
          // if (pageDoc != null && res.doc.id === pageDoc.id) {
          //   setPartialPageData({ pageDoc: res.doc })
          // }
        },
      })
    },
    [send, trashNote, untrashNote]
  )

  const toggleDocBookmark = useCallback(
    async (workspaceId: string, docId: string, bookmarked: boolean) => {
      await send(docId, 'bookmark', {
        api: () => {
          if (bookmarked) {
            return unbookmarkNote(workspaceId, docId)
          } else {
            return bookmarkNote(workspaceId, docId)
          }
        },
        cb: (res) => {
          console.log('Bookmarked doc...', res)
          // updateDocsMap([res.doc.id, res.doc])
          // if (pageDoc != null && res.doc.id === pageDoc.id) {
          //   setPartialPageData({ pageDoc: res.doc })
          // }
        },
      })
    },
    [bookmarkNote, send, unbookmarkNote]
  )

  const deleteStorageApi = useCallback(
    async (workspace: NoteStorage) => {
      await send(workspace.id, 'delete', {
        api: () => removeStorage(workspace.id),
        cb: (res) => {
          console.log('Removed workspace...', res)
        },
      })
    },
    [send, removeStorage]
  )

  const deleteFolderApi = useCallback(
    async (target: { workspaceId: string; pathname: string }) => {
      await send(target.workspaceId, 'delete', {
        api: () => removeFolder(target.workspaceId, target.pathname),
        cb: () => {
          console.log('Removed folder...', target.pathname)
        },
      })
    },
    [send, removeFolder]
  )

  const deleteDocApi = useCallback(
    async (target: { workspaceId: string; docId: string }) => {
      return send(target.workspaceId, 'delete', {
        api: () => deleteNote(target.workspaceId, target.docId),
        cb: () => {
          console.log('Removed doc...', target.docId)
        },
      })
    },
    [send, deleteNote]
  )

  const updateFolderApi = useCallback(
    async (target: FolderDoc, body: UpdateFolderRequestBody) => {
      await send(target._id, 'update', {
        api: () =>
          // not available, should add upsert folder props or find it?
          renameFolder(body.workspaceId, body.oldPathname, body.newPathname),
        cb: () => {
          console.log('Updated folder...', target._id, body)
        },
      })
    },
    [send, renameFolder]
  )

  const updateDocApi = useCallback(
    async (docId: string, body: UpdateDocRequestBody) => {
      await send(docId, 'update', {
        api: () => updateNote(body.workspaceId, docId, body.docProps),
        cb: (doc: NoteDoc) => {
          console.log('Updated note...', doc)
          // if (pageDoc != null && doc.id === pageDoc.id) {
          //   setPartialPageData({ pageDoc: doc })
          //   setCurrentPath(doc.folderPathname)
          // }
        },
      })
    },
    [send, updateNote]
  )

  return {
    sendingMap,
    createWorkspaceApi,
    createDocApi,
    createFolder: createFolderApi,
    toggleDocArchived,
    toggleDocBookmark,
    deleteStorageApi,
    deleteFolderApi,
    deleteDocApi,
    updateDocApi,
    updateFolder: updateFolderApi,
    workspaceMap,
  }
}

export type CreateFolderRequestBody = {
  workspaceId: string
  destinationPathname: string
  folderName: string
}

export type CreateNoteRequestBody = {
  workspaceId: string
  docProps: Partial<NoteDocEditibleProps>
}

export type CreateStorageRequestBody = {
  name: string
  props?: { type: 'fs'; location: string }
}

export interface UpdateFolderRequestBody {
  workspaceId: string
  oldPathname: string
  newPathname: string
}

export interface UpdateDocRequestBody {
  workspaceId: string
  docProps: Partial<NoteDoc>
}

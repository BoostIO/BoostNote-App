import {
  mdiApplicationCog,
  mdiArchive,
  mdiFileDocumentOutline,
  mdiFolderPlusOutline,
  mdiLock,
  mdiPencil,
  mdiTextBoxPlusOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import {
  FolderDoc,
  NoteDoc,
  NoteStorage,
  ObjectMap,
  PopulatedFolderDoc,
} from '../../../db/types'
import {
  getFolderHref,
  getFolderId,
  getFolderNameFromPathname,
  getFolderPathname,
  getDocHref,
  getNoteTitle,
  getParentFolderPathname,
  getWorkspaceHref,
} from '../../../db/utils'
import { LocalNewResourceRequestBody } from '../../hooks/local/useLocalUI'
import { FormRowProps } from '../../../../shared/components/molecules/Form'
import { TopbarBreadcrumbProps } from '../../../../shared/components/organisms/Topbar'
import { topParentId } from '../../../../cloud/lib/mappers/topbarTree'

type AddedProperties =
  | { type: 'folder'; item: FolderDoc }
  | { type: 'doc'; item: NoteDoc }
  | { type: 'workspace'; item: NoteStorage }
  | { type: undefined; item: undefined }

export function mapTopbarBreadcrumbs(
  foldersMap: ObjectMap<FolderDoc>,
  workspace: NoteStorage,
  push: (url: string) => void,
  {
    pageNote,
    pageFolder,
  }: {
    pageNote?: NoteDoc
    pageFolder?: PopulatedFolderDoc
  },
  renameFolder?: (storageId: string, folder: FolderDoc) => void,
  renameNote?: (storageId: string, note: NoteDoc) => void,
  openNewDocForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  openNewFolderForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  editWorkspace?: (storage: NoteStorage) => void,
  deleteOrTrashNote?: (
    storageId: string,
    noteId: string,
    trashed: boolean
  ) => Promise<void>,
  deleteFolder?: (storageName: string, folder: FolderDoc) => void,
  deleteWorkspace?: (storage: NoteStorage) => void
) {
  const items: (TopbarBreadcrumbProps & AddedProperties)[] = []

  let parent:
    | { type: 'folder'; item?: FolderDoc }
    | { type: 'workspace'; item?: NoteStorage }
    | undefined

  if (pageNote != null) {
    const parentFolderDoc = foldersMap[pageNote.folderPathname]
    parent =
      parentFolderDoc != null && pageNote.folderPathname != '/'
        ? { type: 'folder', item: parentFolderDoc }
        : { type: 'workspace', item: workspace }
    items.unshift(
      getDocBreadcrumb(
        workspace.id,
        pageNote,
        true, // why always active
        push,
        renameNote,
        deleteOrTrashNote
      )
    )
  }

  if (pageFolder != null) {
    const parentFolderPathname = getParentFolderPathname(
      getFolderPathname(pageFolder._id)
    )
    const parentFolderDoc = foldersMap[parentFolderPathname]
    parent =
      parentFolderDoc != null && parentFolderPathname != '/'
        ? { type: 'folder', item: parentFolderDoc }
        : { type: 'workspace', item: workspace }
    const pageFolderPathname = getFolderPathname(pageFolder._id)
    if (pageFolderPathname != '/') {
      items.unshift(
        getFolderBreadcrumb(
          pageFolder,
          workspace,
          push,
          openNewDocForm,
          openNewFolderForm,
          renameFolder,
          deleteFolder
        )
      )
    }
  }

  let reversedToTop = false

  while (!reversedToTop) {
    if (parent == null) {
      break
    }

    const addedProperties: AddedProperties & { href: string } =
      parent.item == null
        ? {
            href: '/app/storages/',
            type: undefined,
            item: undefined,
          }
        : parent.type === 'folder'
        ? {
            href: getFolderHref(parent.item, workspace.id),
            type: 'folder',
            item: parent.item,
          }
        : {
            href: getWorkspaceHref(parent.item),
            type: 'workspace',
            item: parent.item,
          }

    if (parent.item == null) {
      items.unshift({
        label: '..',
        parentId: topParentId,
        ...addedProperties,
        link: {
          href: addedProperties.href,
          navigateTo: () => push(addedProperties.href),
        },
        controls: [],
      })
    } else {
      if (parent.type === 'folder') {
        items.unshift(
          getFolderBreadcrumb(
            parent.item,
            workspace,
            push,
            openNewDocForm,
            openNewFolderForm,
            renameFolder,
            deleteFolder
          )
        )
      } else {
        items.unshift(
          mapStorageBreadcrumb(
            parent.item,
            push,
            openNewDocForm,
            openNewFolderForm,
            editWorkspace,
            deleteWorkspace
          )
        )
      }
    }

    if (parent.type === 'workspace') {
      reversedToTop = true
    } else {
      if (parent.item == null) {
        parent = undefined
      } else {
        const folderPathname = getFolderPathname(parent.item._id)
        const parentFolderPathname = getParentFolderPathname(folderPathname)
        const parentFolderDoc = foldersMap[parentFolderPathname]
        parent =
          parentFolderDoc != null && parentFolderPathname != '/'
            ? { type: 'folder', item: parentFolderDoc }
            : {
                type: 'workspace',
                item: workspace,
              }
      }
    }
  }

  return items
}

function getDocBreadcrumb(
  workspaceId: string,
  note: NoteDoc,
  active: boolean,
  push: (url: string) => void,
  renameNote?: (storageId: string, note: NoteDoc) => void,
  deleteOrTrashNote?: (
    storageId: string,
    noteId: string,
    trashed: boolean
  ) => void
): TopbarBreadcrumbProps & AddedProperties {
  const parentFolderId = getFolderId(note.folderPathname)
  return {
    label: getNoteTitle(note, 'Untitled'),
    active,
    parentId: getUnsignedId(workspaceId, parentFolderId),
    icon: mdiFileDocumentOutline,
    emoji: undefined,
    type: 'doc',
    item: note,
    link: {
      href: getDocHref(note, workspaceId),
      navigateTo: () => push(getDocHref(note, workspaceId)),
    },
    controls: [
      ...(renameNote != null
        ? [
            {
              icon: mdiPencil,
              label: 'Rename',
              onClick: () => {
                renameNote(workspaceId, note)
              },
            },
          ]
        : []),
      ...(deleteOrTrashNote != null
        ? [
            note.trashed
              ? {
                  icon: mdiTrashCanOutline,
                  label: 'Delete',
                  onClick: () =>
                    deleteOrTrashNote(workspaceId, note._id, note.trashed),
                }
              : {
                  icon: mdiArchive,
                  label: 'Archive',
                  onClick: () =>
                    deleteOrTrashNote(workspaceId, note._id, note.trashed),
                },
          ]
        : []),
    ],
  }
}

function getFolderBreadcrumb(
  folder: FolderDoc,
  workspace: NoteStorage,
  push: (url: string) => void,
  openNewNoteForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  openNewFolderForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  renameFolder?: (storageId: string, folder: FolderDoc) => void,
  deleteFolder?: (storageName: string, folder: FolderDoc) => void
): TopbarBreadcrumbProps & AddedProperties {
  const folderPathname = getFolderPathname(folder._id)
  const parentFolderPathname = getParentFolderPathname(folderPathname)
  const parentFolderId = workspace.folderMap[parentFolderPathname]?._id
  const newResourceBody = {
    workspaceId: workspace.id, // folder storage ID (only one)
    parentFolderPathname: folderPathname,
  }
  const currentPath = `${workspace.name}${folderPathname}`
  return {
    type: 'folder',
    item: folder,
    label: getFolderNameFromPathname(folderPathname) ?? workspace.name,
    active: true,
    parentId: getUnsignedId(workspace.id, parentFolderId),
    emoji: undefined,
    link: {
      href: getFolderHref(folder, workspace.id),
      navigateTo: () => push(getFolderHref(folder, workspace.id)),
    },
    controls: [
      ...(openNewNoteForm != null
        ? [
            {
              icon: mdiTextBoxPlusOutline,
              label: 'Create a document',
              onClick: () =>
                openNewNoteForm(newResourceBody, [
                  {
                    description: currentPath,
                  },
                ]),
            },
          ]
        : []),
      ...(openNewFolderForm != null
        ? [
            {
              icon: mdiFolderPlusOutline,
              label: 'Create a folder',
              onClick: () =>
                openNewFolderForm(newResourceBody, [
                  {
                    description: currentPath,
                  },
                ]),
            },
          ]
        : []),
      ...(renameFolder != null
        ? [
            {
              icon: mdiPencil,
              label: 'Rename',
              onClick: () => renameFolder(workspace.id, folder),
            },
          ]
        : []),
      ...(deleteFolder != null
        ? [
            {
              icon: mdiTrashCanOutline,
              label: 'Delete',
              onClick: () => deleteFolder(workspace.id, folder),
            },
          ]
        : []),
    ],
  } as TopbarBreadcrumbProps & AddedProperties
}

export function mapStorageBreadcrumb(
  workspace: NoteStorage,
  push: (url: string) => void,
  openNewDocForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  openNewFolderForm?: (
    body: LocalNewResourceRequestBody,
    prevRows?: FormRowProps[]
  ) => void,
  editWorkspace?: (storage: NoteStorage) => void,
  deleteWorkspace?: (storage: NoteStorage) => void
): TopbarBreadcrumbProps & AddedProperties {
  const newResourceBody = {
    workspaceId: workspace.id,
  }

  return {
    type: 'workspace',
    item: workspace,
    label: workspace.name,
    active: true,
    icon: mdiLock, // Default workspace Icon/Emoji
    parentId: topParentId,
    link: {
      href: getWorkspaceHref(workspace),
      navigateTo: () => push(getWorkspaceHref(workspace)),
    },
    controls: [
      ...(openNewDocForm != null
        ? [
            {
              icon: mdiTextBoxPlusOutline,
              label: 'Create a document',
              onClick: () =>
                openNewDocForm(newResourceBody, [
                  {
                    description: workspace.name,
                  },
                ]),
            },
          ]
        : []),
      ...(openNewFolderForm != null
        ? [
            {
              icon: mdiFolderPlusOutline,
              label: 'Create a folder',
              onClick: () =>
                openNewFolderForm(newResourceBody, [
                  {
                    description: workspace.name,
                  },
                ]),
            },
          ]
        : []),
      ...(editWorkspace != null
        ? [
            {
              icon: mdiApplicationCog,
              label: 'Edit',
              onClick: () => editWorkspace(workspace),
            },
          ]
        : []),
      ...(deleteWorkspace != null // !storage.default = one storage - always default?
        ? [
            {
              icon: mdiTrashCanOutline,
              label: 'Delete',
              onClick: () => deleteWorkspace(workspace),
            },
          ]
        : []),
    ],
  }
}

function getUnsignedId(fallbackId: string, folderId?: string) {
  if (folderId != null && getFolderPathname(folderId) != '/') {
    return folderId
  }
  return fallbackId
}

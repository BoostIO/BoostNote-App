import {
  mdiApplicationCog,
  mdiFileDocumentOutline,
  mdiFolderPlusOutline,
  mdiLock,
  mdiPencil,
  mdiTextBoxPlus,
  mdiTrashCanOutline,
} from '@mdi/js'
import { TFunction } from 'i18next'
import { TopbarBreadcrumbProps } from '../../../design/components/organisms/Topbar'
import { getDocLinkHref } from '../../components/Link/DocLink'
import { getFolderHref } from '../../components/Link/FolderLink'
import { getTeamLinkHref } from '../../components/Link/TeamLink'
import { getWorkspaceHref } from '../../components/Link/WorkspaceLink'
import { SerializedDoc } from '../../interfaces/db/doc'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import {
  CloudNewResourceRequestBody,
  UIFormOptions,
} from '../hooks/useCloudResourceModals'
import { lngKeys } from '../i18n/types'
import { getDocTitle, prefixFolders } from '../utils/patterns'
import { getHexFromUUID } from '../utils/string'
import { topParentId } from './topbarTree'

type AddedProperties =
  | { type: 'folder'; item: SerializedFolder }
  | { type: 'doc'; item: SerializedDoc }
  | { type: 'wp'; item: SerializedWorkspace }
  | { type: undefined; item: undefined }

export function mapTopbarBreadcrumbs(
  t: TFunction,
  team: SerializedTeam,
  foldersMap: Map<string, SerializedFolderWithBookmark>,
  workspacesMap: Map<string, SerializedWorkspace>,
  push: (url: string) => void,
  {
    pageDoc,
    pageFolder,
  }: {
    pageDoc?: SerializedDoc
    pageFolder?: SerializedFolder
  },
  renameFolder?: (folder: SerializedFolder) => void,
  renameDoc?: (doc: SerializedDoc) => void,
  openNewDocForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  openNewFolderForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  editWorkspace?: (wp: SerializedWorkspace) => void,
  deleteDoc?: (doc: SerializedDoc) => void,
  deleteFolder?: (folder: SerializedFolder) => void,
  deleteWorkspace?: (wp: SerializedWorkspace) => void
) {
  const items: (TopbarBreadcrumbProps & AddedProperties)[] = []

  let parent:
    | { type: 'folder'; item?: SerializedFolder }
    | { type: 'workspace'; item?: SerializedWorkspace }
    | undefined

  if (pageDoc != null) {
    parent =
      pageDoc.parentFolderId != null
        ? { type: 'folder', item: foldersMap.get(pageDoc.parentFolderId) }
        : { type: 'workspace', item: workspacesMap.get(pageDoc.workspaceId) }

    items.unshift(
      getDocBreadcrumb(t, team, pageDoc, true, push, renameDoc, deleteDoc)
    )
  }

  let parentWorkspace: SerializedWorkspace | undefined
  if (pageFolder != null) {
    parentWorkspace = workspacesMap.get(pageFolder.workspaceId)
    parent =
      pageFolder.parentFolderId != null
        ? { type: 'folder', item: foldersMap.get(pageFolder.parentFolderId) }
        : { type: 'workspace', item: parentWorkspace }

    items.unshift(
      getFolderBreadcrumb(
        t,
        team,
        pageFolder,
        workspacesMap,
        push,
        openNewDocForm,
        openNewFolderForm,
        renameFolder,
        deleteFolder
      )
    )
  }

  let reversedToTop = false

  while (!reversedToTop) {
    if (parent == null) {
      break
    }

    const addedProperties: AddedProperties & { href: string } =
      parent.item == null
        ? {
            href: getTeamLinkHref(team, 'index'),
            item: undefined,
            type: undefined,
          }
        : parent.type === 'folder'
        ? {
            href: getFolderHref(parent.item, team, 'index'),
            type: 'folder',
            item: parent.item,
          }
        : {
            href: getWorkspaceHref(parent.item, team, 'index'),
            type: 'wp',
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
            t,
            team,
            parent.item,
            workspacesMap,
            push,
            openNewDocForm,
            openNewFolderForm,
            renameFolder,
            deleteFolder
          )
        )
      } else {
        items.unshift(
          mapWorkspaceBreadcrumb(
            t,
            team,
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
      parent =
        parent.item == null
          ? undefined
          : parent.item.parentFolderId != null
          ? { type: 'folder', item: foldersMap.get(parent.item.parentFolderId) }
          : {
              type: 'workspace',
              item: workspacesMap.get(parent.item.workspaceId),
            }
    }
  }

  return items
}

function getDocBreadcrumb(
  t: TFunction,
  team: SerializedTeam,
  doc: SerializedDoc,
  active: boolean,
  push: (url: string) => void,
  renameDoc?: (doc: SerializedDoc) => void,
  deleteDoc?: (doc: SerializedDoc) => void
): TopbarBreadcrumbProps & AddedProperties {
  return {
    label: getDocTitle(doc, 'Untitled'),
    active,
    parentId: getUnsignedId(doc.workspaceId, doc.parentFolderId),
    icon: mdiFileDocumentOutline,
    emoji: doc.emoji,
    type: 'doc',
    item: doc,
    link: {
      href: getDocLinkHref(doc, team, 'index'),
      navigateTo: () => push(getDocLinkHref(doc, team, 'index')),
    },
    controls: [
      ...(renameDoc != null
        ? [
            {
              icon: mdiPencil,
              label: t(lngKeys.GeneralRenameVerb),
              onClick: () => renameDoc(doc),
            },
          ]
        : []),
      ...(deleteDoc != null
        ? [
            {
              icon: mdiTrashCanOutline,
              label: t(lngKeys.GeneralDelete),
              onClick: () => deleteDoc(doc),
            },
          ]
        : []),
    ],
  }
}

function getFolderBreadcrumb(
  t: TFunction,
  team: SerializedTeam,
  folder: SerializedFolder,
  workspacesMap: Map<string, SerializedWorkspace>,
  push: (url: string) => void,
  openNewDocForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  openNewFolderForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  renameFolder?: (folder: SerializedFolder) => void,
  deleteFolder?: (folder: SerializedFolder) => void
): TopbarBreadcrumbProps & AddedProperties {
  const newResourceBody = {
    team,
    workspaceId: folder.workspaceId,
    parentFolderId: folder.id,
  }

  const currentPath = `${workspacesMap.get(folder.workspaceId)?.name}${
    folder.pathname
  }`

  return {
    type: 'folder',
    item: folder,
    label: folder.name,
    active: true,
    parentId: getUnsignedId(folder.workspaceId, folder.parentFolderId),
    emoji: folder.emoji,
    link: {
      href: getFolderHref(folder, team, 'index'),
      navigateTo: () => push(getFolderHref(folder, team, 'index')),
    },
    controls: [
      ...(openNewDocForm != null
        ? [
            {
              icon: mdiTextBoxPlus,
              label: t(lngKeys.ModalsCreateNewDocument),
              onClick: () =>
                openNewDocForm(newResourceBody, {
                  precedingRows: [
                    {
                      description: currentPath,
                    },
                  ],
                }),
            },
          ]
        : []),
      ...(openNewFolderForm != null
        ? [
            {
              icon: mdiFolderPlusOutline,
              label: t(lngKeys.ModalsCreateNewFolder),
              onClick: () =>
                openNewFolderForm(newResourceBody, {
                  precedingRows: [
                    {
                      description: currentPath,
                    },
                  ],
                }),
            },
          ]
        : []),
      ...(renameFolder != null
        ? [
            {
              icon: mdiPencil,
              label: t(lngKeys.GeneralRenameVerb),
              onClick: () => renameFolder(folder),
            },
          ]
        : []),
      ...(deleteFolder != null
        ? [
            {
              icon: mdiTrashCanOutline,
              label: t(lngKeys.GeneralDelete),
              onClick: () => deleteFolder(folder),
            },
          ]
        : []),
    ],
  }
}

export function mapWorkspaceBreadcrumb(
  t: TFunction,
  team: SerializedTeam,
  workspace: SerializedWorkspace,
  push: (url: string) => void,
  openNewDocForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  openNewFolderForm?: (
    body: CloudNewResourceRequestBody,
    options: UIFormOptions
  ) => void,
  editWorkspace?: (wp: SerializedWorkspace) => void,
  deleteWorkspace?: (wp: SerializedWorkspace) => void
): TopbarBreadcrumbProps & AddedProperties {
  const newResourceBody = {
    team,
    workspaceId: workspace.id,
  }

  return {
    type: 'wp',
    item: workspace,
    label: workspace.name,
    active: true,
    icon: workspace.public ? undefined : mdiLock,
    parentId: topParentId,
    link: {
      href: getWorkspaceHref(workspace, team, 'index'),
      navigateTo: () => push(getWorkspaceHref(workspace, team, 'index')),
    },
    controls: [
      ...(openNewDocForm != null
        ? [
            {
              icon: mdiTextBoxPlus,
              label: t(lngKeys.ModalsCreateNewDocument),
              onClick: () =>
                openNewDocForm(newResourceBody, {
                  precedingRows: [
                    {
                      description: workspace.name,
                    },
                  ],
                }),
            },
          ]
        : []),
      ...(openNewFolderForm != null
        ? [
            {
              icon: mdiFolderPlusOutline,
              label: t(lngKeys.ModalsCreateNewFolder),
              onClick: () =>
                openNewFolderForm(newResourceBody, {
                  precedingRows: [
                    {
                      description: workspace.name,
                    },
                  ],
                }),
            },
          ]
        : []),
      ...(editWorkspace != null && !workspace.personal
        ? [
            {
              icon: mdiApplicationCog,
              label: t(lngKeys.GeneralEditVerb),
              onClick: () => editWorkspace(workspace),
            },
          ]
        : []),
      ...(deleteWorkspace != null && !workspace.default && !workspace.personal
        ? [
            {
              icon: mdiTrashCanOutline,
              label: t(lngKeys.GeneralDelete),
              onClick: () => deleteWorkspace(workspace),
            },
          ]
        : []),
    ],
  }
}

function getUnsignedId(fallbackId: string, folderId?: string) {
  if (folderId != null) {
    return [prefixFolders, getHexFromUUID(folderId)].join('')
  }

  return fallbackId
}

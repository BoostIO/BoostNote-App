import { mdiFileDocumentOutline, mdiLock } from '@mdi/js'
import { getDocLinkHref } from '../../../../cloud/components/atoms/Link/DocLink'
import { getFolderHref } from '../../../../cloud/components/atoms/Link/FolderLink'
import { getTeamLinkHref } from '../../../../cloud/components/atoms/Link/TeamLink'
import { getWorkspaceHref } from '../../../../cloud/components/atoms/Link/WorkspaceLink'
import { SerializedDoc } from '../../../../cloud/interfaces/db/doc'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../../cloud/interfaces/db/folder'
import { SerializedTeam } from '../../../../cloud/interfaces/db/team'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import {
  getDocTitle,
  prefixFolders,
} from '../../../../cloud/lib/utils/patterns'
import { getHexFromUUID } from '../../../../cloud/lib/utils/string'
import { TopbarBreadcrumbProps } from '../../../../components/v2/organisms/Topbar'
import { topParentId } from './topbarTree'

type AddedProperties =
  | { type: 'folder'; item: SerializedFolder }
  | { type: 'doc'; item: SerializedDoc }
  | { type: 'wp'; item: SerializedWorkspace }
  | { type: undefined; item: undefined }

export function mapTopbarBreadcrumbs(
  team: SerializedTeam,
  foldersMap: Map<string, SerializedFolderWithBookmark>,
  workspacesMap: Map<string, SerializedWorkspace>,
  push: (url: string) => void,
  {
    pageDoc,
    pageFolder,
  }: { pageDoc?: SerializedDoc; pageFolder?: SerializedFolder },
  renameFolder?: (folder: SerializedFolder) => void,
  renameDoc?: (doc: SerializedDoc) => void
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

    items.unshift({
      label: getDocTitle(pageDoc, 'Untitled'),
      active: true,
      parentId: getUnsignedId(pageDoc.workspaceId, pageDoc.parentFolderId),
      icon: mdiFileDocumentOutline,
      emoji: pageDoc.emoji,
      type: 'doc',
      item: pageDoc,
      link: {
        href: getDocLinkHref(pageDoc, team, 'index'),
        navigateTo: () => push(getDocLinkHref(pageDoc, team, 'index')),
      },
      controls:
        renameDoc != null
          ? [{ label: 'Rename doc', onClick: () => renameDoc(pageDoc) }]
          : undefined,
    })
  }

  if (pageFolder != null) {
    parent =
      pageFolder.parentFolderId != null
        ? { type: 'folder', item: foldersMap.get(pageFolder.parentFolderId) }
        : { type: 'workspace', item: workspacesMap.get(pageFolder.workspaceId) }

    items.unshift({
      label: pageFolder.name,
      active: true,
      parentId: getUnsignedId(
        pageFolder.workspaceId,
        pageFolder.parentFolderId
      ),
      emoji: pageFolder.emoji,
      type: 'folder',
      item: pageFolder,
      link: {
        href: getFolderHref(pageFolder, team, 'index'),
        navigateTo: () => push(getFolderHref(pageFolder, team, 'index')),
      },
      controls:
        renameFolder != null
          ? [
              {
                label: 'Rename folder',
                onClick: () => renameFolder(pageFolder),
              },
            ]
          : [],
    })
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

    items.unshift({
      label: parent.item?.name || '..',
      parentId:
        parent.item == null || parent.type === 'workspace'
          ? topParentId
          : getUnsignedId(parent.item.workspaceId, parent.item.parentFolderId),
      icon:
        parent.type === 'workspace' && !parent.item?.public
          ? mdiLock
          : undefined,
      emoji: parent.type === 'folder' ? parent.item?.emoji : undefined,
      ...addedProperties,
      link: {
        href: addedProperties.href,
        navigateTo: () => push(addedProperties.href),
      },
      controls:
        addedProperties.type === 'folder' && renameFolder != null
          ? [
              {
                label: 'Rename folder',
                onClick: () => renameFolder(addedProperties.item),
              },
            ]
          : undefined,
    })

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

function getUnsignedId(fallbackId: string, folderId?: string) {
  if (folderId != null) {
    return [prefixFolders, getHexFromUUID(folderId)].join('')
  }

  return fallbackId
}

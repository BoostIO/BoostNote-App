import { mdiFileDocumentOutline, mdiLock } from '@mdi/js'
import { getDocLinkHref } from '../../components/atoms/Link/DocLink'
import { getFolderHref } from '../../components/atoms/Link/FolderLink'
import { getWorkspaceHref } from '../../components/atoms/Link/WorkspaceLink'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { getDocId, getDocTitle, getFolderId } from '../utils/patterns'
import { getMapValues } from '../../../shared/lib/utils/array'
import { BreadCrumbTreeItem } from '../../../shared/lib/mappers/types'

export const topParentId = 'root'

export function mapTopbarTree(
  team: SerializedTeam,
  initialLoadDone: boolean,
  docsMap: Map<string, SerializedDocWithBookmark>,
  foldersMap: Map<string, SerializedFolderWithBookmark>,
  workspacesMap: Map<string, SerializedWorkspace>,
  push: (url: string) => void
) {
  if (!initialLoadDone) {
    return undefined
  }

  const items = new Map<string, BreadCrumbTreeItem[]>()

  const [docs, folders, workspaces] = [
    getMapValues(docsMap),
    getMapValues(foldersMap),
    getMapValues(workspacesMap),
  ]

  items.set(
    topParentId,
    workspaces.reduce((acc, wp) => {
      const href = `${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
        wp,
        team,
        'index'
      )}`

      acc.push({
        id: wp.id,
        label: wp.name,
        parentId: topParentId,
        defaultIcon: !wp.public ? mdiLock : undefined,
        link: {
          href,
          navigateTo: () => push(href),
        },
      })

      return acc
    }, [] as BreadCrumbTreeItem[])
  )

  folders.forEach((folder) => {
    if (folder.pathname == '/') return
    const folderId = getFolderId(folder)
    const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
      folder,
      team,
      'index'
    )}`

    const parentId =
      folder.parentFolderId == null
        ? folder.workspaceId
        : getFolderId({ id: folder.parentFolderId } as any)

    const parentArray = items.get(parentId) || []
    parentArray.push({
      id: folderId,
      label: folder.name,
      emoji: folder.emoji,
      parentId,
      link: {
        href,
        navigateTo: () => push(href),
      },
    })
    items.set(parentId, parentArray)
  })

  docs
    .filter((doc) => doc.archivedAt == null)
    .forEach((doc) => {
      const docId = getDocId(doc)
      const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
        doc,
        team,
        'index'
      )}`

      const parentId =
        doc.parentFolderId == null
          ? doc.workspaceId
          : getFolderId({ id: doc.parentFolderId } as any)
      const parentArray = items.get(parentId) || []
      parentArray.push({
        id: docId,
        label: getDocTitle(doc, 'Untitled'),
        emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        parentId:
          doc.parentFolderId == null ? doc.workspaceId : doc.parentFolderId,
        link: {
          href,
          navigateTo: () => push(href),
        },
      })
      items.set(parentId, parentArray)
    })
  return items
}

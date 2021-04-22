import { getDocLinkHref } from '../../components/atoms/Link/DocLink'
import { getFolderHref } from '../../components/atoms/Link/FolderLink'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { getDocTitle } from '../utils/patterns'
import { getMapValues } from '../../../shared/lib/utils/array'
import { ContentManagerItemProps } from '../../../shared/lib/mappers/types'

type CloudCategories = 'folders' | 'documents' | 'archived'

export function mapManagerRows(
  team: SerializedTeam,
  parent: { workspaceId: string; parentFolderId?: string },
  docsMap: Map<string, SerializedDocWithBookmark>,
  foldersMap: Map<string, SerializedFolderWithBookmark>
) {
  const items = [] as ContentManagerItemProps<CloudCategories>[]

  const [docs, folders] = [
    getMapValues(docsMap).filter(
      (doc) =>
        doc.workspaceId === parent.workspaceId &&
        doc.parentFolderId === parent.parentFolderId
    ),
    getMapValues(foldersMap).filter(
      (folder) =>
        folder.workspaceId === parent.workspaceId &&
        folder.parentFolderId === parent.parentFolderId
    ),
  ]

  docs.forEach((doc) => {
    const item: ContentManagerItemProps<CloudCategories> = {
      id: doc.id,
      label: getDocTitle(doc),

      href: `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
        doc,
        team,
        'index'
      )}`,
      category: doc.archivedAt != null ? 'archived' : 'documents',
      lastUpdated: doc.head?.created || doc.updatedAt,
      lastUpdatedBy:
        doc.head == null
          ? undefined
          : doc.head.creators.map((creator) => creator.id),
      controls: [],
      badges: (doc.tags || []).map((tag) => tag.text),
    }

    items.push(item)
  })

  folders.forEach((folder) => {
    const item: ContentManagerItemProps<CloudCategories> = {
      id: folder.id,
      label: folder.name,
      href: `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        folder,
        team,
        'index'
      )}`,
      category: 'folders',
      lastUpdated: folder.updatedAt,
      controls: [],
    }

    items.push(item)
  })

  return items
}

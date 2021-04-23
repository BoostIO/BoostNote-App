import { mdiFileDocumentOutline, mdiLock } from '@mdi/js'
import { FuzzyNavigationItemAttrbs } from '../../../shared/components/organisms/FuzzyNavigation/molecules/FuzzyNavigationItem'
import { getMapValues } from '../../../shared/lib/utils/array'
import { HistoryItem } from '../../api/search'
import { getDocLinkHref } from '../../components/atoms/Link/DocLink'
import { getFolderHref } from '../../components/atoms/Link/FolderLink'
import { getWorkspaceHref } from '../../components/atoms/Link/WorkspaceLink'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { getDocTitle } from '../utils/patterns'

export function mapFuzzyNavigationRecentItems(
  team: SerializedTeam,
  history: HistoryItem[],
  push: (href: string) => void,
  docsMap: Map<string, SerializedDoc>,
  foldersMap: Map<string, SerializedFolder>,
  workspacesMap: Map<string, SerializedWorkspace>
) {
  const items: FuzzyNavigationItemAttrbs[] = []

  history.forEach((historyItem) => {
    if (historyItem.type === 'folder') {
      const item = foldersMap.get(historyItem.item)
      if (item != null) {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
          item,
          team,
          'index'
        )}`
        items.push({
          emoji: item.emoji,
          label: item.name,
          path: `${
            workspacesMap.get(item.workspaceId)?.name
          }${item.pathname.substr(0, item.pathname.lastIndexOf('/'))}`,
          href,
          onClick: () => push(href),
        })
      }
    } else {
      const item = docsMap.get(historyItem.item)
      if (item != null) {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
          item,
          team,
          'index'
        )}`
        items.push({
          emoji: item.emoji,
          icon: mdiFileDocumentOutline,
          label: getDocTitle(item, 'Untitled'),
          path: `${workspacesMap.get(item.workspaceId)?.name}${
            item.folderPathname
          }`,
          href,
          onClick: () => push(href),
        })
      }
    }
  })

  return items
}

export function mapFuzzyNavigationItems(
  team: SerializedTeam,
  push: (href: string) => void,
  docsMap: Map<string, SerializedDoc>,
  foldersMap: Map<string, SerializedFolder>,
  workspacesMap: Map<string, SerializedWorkspace>
): FuzzyNavigationItemAttrbs[] {
  const items: FuzzyNavigationItemAttrbs[] = []

  getMapValues(workspacesMap).forEach((val) => {
    const href = `${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
      val,
      team,
      'index'
    )}`

    items.push({
      icon: !val.public ? mdiLock : undefined,
      label: val.name,
      path: val.name,
      href,
      onClick: () => push(href),
    })
  })

  getMapValues(foldersMap).forEach((val) => {
    const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
      val,
      team,
      'index'
    )}`

    items.push({
      emoji: val.emoji,
      label: val.name,
      path: `${workspacesMap.get(val.workspaceId)?.name}${val.pathname.substr(
        0,
        val.pathname.lastIndexOf('/')
      )}`,
      href,
      onClick: () => push(href),
    })
  })

  getMapValues(docsMap).forEach((val) => {
    const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
      val,
      team,
      'index'
    )}`

    items.push({
      icon: mdiFileDocumentOutline,
      emoji: val.emoji,
      label: getDocTitle(val, 'Untitled'),
      path: `${workspacesMap.get(val.workspaceId)?.name}${val.folderPathname}`,
      href,
      onClick: () => push(href),
    })
  })

  return items
}

import {
  mdiAccountMultiplePlusOutline,
  mdiClockOutline,
  mdiCogOutline,
  mdiDotsHorizontal,
  mdiDownload,
  mdiFileDocumentMultipleOutline,
  mdiFileDocumentOutline,
  mdiLock,
  mdiLogoutVariant,
  mdiMagnify,
  mdiPlusCircleOutline,
  mdiTag,
} from '@mdi/js'
import { stringify } from 'querystring'
import React, { useCallback, useMemo, useState } from 'react'
import { buildIconUrl } from '../../cloud/api/files'
import {
  TeamLinkIntent,
  useNavigateToTeam,
} from '../../cloud/components/atoms/Link/TeamLink'
import ImportModal from '../../cloud/components/organisms/Modal/contents/Import/ImportModal'
import { Url, useRouter } from '../../cloud/lib/router'
import { useGlobalData } from '../../cloud/lib/stores/globalData'
import { usePage } from '../../cloud/lib/stores/pageStore'
import { usePreferences } from '../../cloud/lib/stores/preferences'
import { getHexFromUUID } from '../../cloud/lib/utils/string'
import { SidebarState } from '../../lib/v2/sidebar'
import RoundedImage from './atoms/RoundedImage'
import { usingElectron, sendToHost } from '../../cloud/lib/stores/electron'
import {
  getDocId,
  getDocTitle,
  getFolderId,
  getTeamURL,
} from '../../cloud/lib/utils/patterns'
import { useNav } from '../../cloud/lib/stores/nav'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../../cloud/lib/stores/sidebarCollapse'
import { SidebarSpace } from './organisms/Sidebar/molecules/SidebarSpaces'
import { SidebarToolbarRow } from './organisms/Sidebar/molecules/SidebarToolbar'
import {
  SidebarNavCategory,
  SidebarTreeChildRow,
} from './organisms/Sidebar/molecules/SidebarTree'
import { getMapValues } from '../../lib/v2/utils/array'
import {
  MenuItem,
  MenuTypes,
  useContextMenu,
} from '../../lib/v2/stores/contextMenu'
import ContextMenu from '../../components/v2/molecules/ContextMenu'
import Checkbox from './atoms/Checkbox'
import ApplicationLayout from './molecules/ApplicationLayout'
import Sidebar from './organisms/Sidebar/index'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../cloud/interfaces/db/doc'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../cloud/interfaces/db/folder'
import { SerializedWorkspace } from '../../cloud/interfaces/db/workspace'
import { SerializedTag } from '../../cloud/interfaces/db/tag'
import { SerializedTeam } from '../../cloud/interfaces/db/team'
import { SerializedTeamInvite } from '../../cloud/interfaces/db/teamInvite'
import {
  getFolderHref,
  useNavigateToFolder,
} from '../../cloud/components/atoms/Link/FolderLink'
import {
  useNavigateToWorkspace,
  getWorkspaceHref,
} from '../../cloud/components/atoms/Link/WorkspaceLink'
import {
  getDocLinkHref,
  useNavigateToDoc,
} from '../../cloud/components/atoms/Link/DocLink'
import {
  getTagHref,
  useNavigateToTag,
} from '../../cloud/components/atoms/Link/TagLink'
import Toast from './organisms/Toast'
import EmojiPicker from './molecules/EmojiPicker'
import { ModalOpeningOptions, useModal } from '../../lib/v2/stores/modal'
import ModalV1 from '../../cloud/components/organisms/Modal'
import Modal from './organisms/Modal'
import Dialog from './organisms/Dialog/Dialog'
import { FoldingProps } from './atoms/FoldingWrapper'

const Application: React.FC<{}> = ({ children }) => {
  const { preferences, setPreferences } = usePreferences()
  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
  } = useNav()
  const {
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    toggleItem,
    unfoldItem,
    foldItem,
  } = useSidebarCollapse()
  const { popup } = useContextMenu()
  const { team } = usePage()
  const { openModal } = useModal()
  const {
    globalData: { teams, invites },
  } = useGlobalData()
  const { push } = useRouter()
  const navigateToTeam = useNavigateToTeam()
  const navigateToDoc = useNavigateToDoc()
  const navigateToFolder = useNavigateToFolder()
  const navigateToWorkspace = useNavigateToWorkspace()
  const navigateToLabel = useNavigateToTag()

  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )

  const openState = useCallback((state: SidebarState) => {
    setSidebarState((prev) => (prev === state ? undefined : state))
  }, [])

  const getFoldEvents = useCallback(
    (type: CollapsableType, key: string) => {
      return {
        fold: () => foldItem(type, key),
        unfold: () => unfoldItem(type, key),
        toggle: () => toggleItem(type, key),
      }
    },
    [toggleItem, unfoldItem, foldItem]
  )

  const sidebarResize = useCallback(
    (width: number) => setPreferences({ sideBarWidth: width }),
    [setPreferences]
  )

  const tree = useMemo(() => {
    return mapTree(
      initialLoadDone,
      docsMap,
      foldersMap,
      workspacesMap,
      tagsMap,
      sideBarOpenedLinksIdsSet,
      sideBarOpenedFolderIdsSet,
      sideBarOpenedWorkspaceIdsSet,
      toggleItem,
      getFoldEvents,
      navigateToDoc,
      navigateToFolder,
      navigateToWorkspace,
      navigateToLabel,
      team
    )
  }, [
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedLinksIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    toggleItem,
    getFoldEvents,
    navigateToDoc,
    navigateToFolder,
    navigateToWorkspace,
    navigateToLabel,
    team,
  ])

  const treeControls = useMemo(() => {
    return mapTreeControls(tree || [], popup)
  }, [popup, tree])

  const toolbarRows: SidebarToolbarRow[] = useMemo(() => {
    return mapToolbarRows(openState, openModal, sidebarState, team)
  }, [sidebarState, openModal, team, openState])

  const spaces = useMemo(() => {
    return mapSpaces(navigateToTeam, push, teams, invites, team)
  }, [navigateToTeam, teams, team, invites, push])

  return (
    <>
      <ModalV1 />
      <Modal />
      <Toast />
      <ContextMenu />
      <EmojiPicker />
      <Dialog />
      <ApplicationLayout
        sidebar={
          <Sidebar
            className='application__sidebar'
            toolbarRows={toolbarRows}
            spaces={spaces}
            spaceBottomRows={buildSpacesBottomRows(push)}
            sidebarExpandedWidth={preferences.sideBarWidth}
            sidebarState={sidebarState}
            tree={tree}
            treeControls={treeControls}
            sidebarResize={sidebarResize}
          />
        }
        pageBody={children}
      />
    </>
  )
}

export default Application

function mapTree(
  initialLoadDone: boolean,
  docsMap: Map<string, SerializedDocWithBookmark>,
  foldersMap: Map<string, SerializedFolderWithBookmark>,
  workspacesMap: Map<string, SerializedWorkspace>,
  tagsMap: Map<string, SerializedTag>,
  sideBarOpenedLinksIdsSet: Set<string>,
  sideBarOpenedFolderIdsSet: Set<string>,
  sideBarOpenedWorkspaceIdsSet: Set<string>,
  toggleItem: (type: CollapsableType, id: string) => void,
  getFoldEvents: (type: CollapsableType, key: string) => FoldingProps,
  navigateToDoc: (
    doc: SerializedDoc,
    team: SerializedTeam,
    intent: 'index',
    query?: any
  ) => void,
  navigateToFolder: (
    folder: SerializedFolder,
    team: SerializedTeam,
    intent: 'index',
    query?: any
  ) => void,
  navigateToWorkspace: (
    workspace: SerializedWorkspace,
    team: SerializedTeam,
    intent: 'index',
    query?: any
  ) => void,
  navigateToLabel: (
    tag: SerializedTag,
    team: SerializedTeam,
    intent: 'index',
    query?: any
  ) => void,
  team?: SerializedTeam
) {
  if (!initialLoadDone || team == null) {
    return undefined
  }

  const items = new Map<string, CloudTreeItem>()

  const [docs, folders, workspaces] = [
    getMapValues(docsMap),
    getMapValues(foldersMap),
    getMapValues(workspacesMap),
  ]

  workspaces.forEach((wp) => {
    items.set(wp.id, {
      id: wp.id,
      label: wp.name,
      defaultIcon: !wp.public ? mdiLock : undefined,
      children: wp.positions?.orderedIds || [],
      folded: !sideBarOpenedWorkspaceIdsSet.has(wp.id),
      folding: getFoldEvents('workspaces', wp.id),
      href: `${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
        wp,
        team,
        'index'
      )}`,
      navigateTo: () => navigateToWorkspace(wp, team, 'index'),
    })
  })

  folders.forEach((folder) => {
    const folderId = getFolderId(folder)
    items.set(folderId, {
      id: folderId,
      label: folder.name,
      bookmarked: folder.bookmarked,
      emoji: folder.emoji,
      folded: !sideBarOpenedFolderIdsSet.has(folder.id),
      folding: getFoldEvents('folders', folder.id),
      href: `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        folder,
        team,
        'index'
      )}`,
      navigateTo: () => navigateToFolder(folder, team, 'index'),
      parentId:
        folder.parentFolderId == null
          ? folder.workspaceId
          : folder.parentFolderId,
      children:
        typeof folder.positions != null && typeof folder.positions !== 'string'
          ? folder.positions.orderedIds
          : [],
    })
  })

  docs.forEach((doc) => {
    const docId = getDocId(doc)
    items.set(docId, {
      id: docId,
      label: getDocTitle(doc, 'Untitled'),
      bookmarked: doc.bookmarked,
      emoji: doc.emoji,
      defaultIcon: mdiFileDocumentOutline,
      archived: doc.archivedAt != null,
      children: [],
      href: `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
        doc,
        team,
        'index'
      )}`,
      navigateTo: () => navigateToDoc(doc, team, 'index'),
      parentId:
        doc.parentFolderId == null ? doc.workspaceId : doc.parentFolderId,
    })
  })

  const arrayItems = getMapValues(items)
  const tree: Partial<SidebarNavCategory>[] = []

  const bookmarked = arrayItems.reduce((acc, val) => {
    if (!val.bookmarked) {
      return acc
    }

    acc.push({
      id: val.id,
      depth: 0,
      label: val.label,
      emoji: val.emoji,
      defaultIcon: val.defaultIcon,
      href: val.href,
      navigateTo: val.navigateTo,
    })
    return acc
  }, [] as SidebarTreeChildRow[])

  const navTree = arrayItems
    .filter((item) => item.parentId == null)
    .reduce((acc, val) => {
      acc.push({
        ...val,
        depth: 0,
        rows: buildChildrenNavRows(val.children, 1, items),
      })
      return acc
    }, [] as SidebarTreeChildRow[])

  const docsPerTagIdMap = [...docsMap.values()].reduce((acc, doc) => {
    const docTags = doc.tags || []
    docTags.forEach((tag) => {
      let docIds = acc.get(tag.id)
      if (docIds == null) {
        docIds = []
        acc.set(tag.id, docIds)
      }
      docIds.push(doc.id)
    })
    return acc
  }, new Map<string, string[]>())

  const labels = getMapValues(tagsMap)
    .filter((tag) => (docsPerTagIdMap.get(tag.id) || []).length > 0)
    .sort((a, b) => {
      if (a.text < b.text) {
        return -1
      } else {
        return 1
      }
    })
    .reduce((acc, val) => {
      acc.push({
        id: val.id,
        depth: 0,
        label: val.text,
        defaultIcon: mdiTag,
        href: `${process.env.BOOST_HUB_BASE_URL}${getTagHref(
          val,
          team,
          'index'
        )}`,
        navigateTo: () => navigateToLabel(val, team, 'index'),
      })
      return acc
    }, [] as SidebarTreeChildRow[])

  const archived = arrayItems.reduce((acc, val) => {
    if (!val.archived) {
      return acc
    }

    acc.push({
      id: val.id,
      depth: 0,
      label: val.label,
      emoji: val.emoji,
      defaultIcon: val.defaultIcon,
      href: val.href,
      navigateTo: val.navigateTo,
    })
    return acc
  }, [] as SidebarTreeChildRow[])

  if (bookmarked.length > 0) {
    tree.push({
      label: 'Bookmarks',
      rows: bookmarked,
    })
  }
  tree.push({
    label: 'Folders',
    shrink: 2,
    rows: navTree,
  })
  if (labels.length > 0) {
    tree.push({
      label: 'Labels',
      rows: labels,
    })
  }
  if (archived.length > 0) {
    tree.push({
      label: 'Archived',
      rows: archived,
    })
  }

  tree.forEach((category) => {
    const key = (category.label || '').toLocaleLowerCase()
    const foldKey = `fold-${key}`
    const hideKey = `hide-${key}`
    category.folded = !sideBarOpenedLinksIdsSet.has(foldKey)
    category.folding = getFoldEvents('links', foldKey)
    category.hidden = sideBarOpenedLinksIdsSet.has(hideKey)
    category.toggleHidden = () => toggleItem('links', hideKey)
  })

  return tree as SidebarNavCategory[]
}

function mapTreeControls(
  tree: SidebarNavCategory[],
  popup: (event: React.MouseEvent, menuItems: MenuItem[]) => void
) {
  if (tree.length === 0) {
    return undefined
  }

  return [
    {
      icon: mdiDotsHorizontal,
      onClick: (event: React.MouseEvent) =>
        popup(
          event,
          (tree || []).map((category) => {
            return {
              type: MenuTypes.Normal,
              onClick: category.toggleHidden,
              label: (
                <span>
                  <Checkbox checked={!category.hidden} />
                  <span style={{ paddingLeft: 6 }}>{category.label}</span>
                </span>
              ),
            }
          })
        ),
    },
  ]
}

function mapToolbarRows(
  openState: (sidebarState: SidebarState) => void,
  openModal: (cmp: JSX.Element, options?: ModalOpeningOptions) => void,
  sidebarState?: SidebarState,
  team?: SerializedTeam
) {
  const rows: SidebarToolbarRow[] = []
  if (team != null) {
    rows.push({
      tooltip: 'Spaces',
      active: sidebarState === 'spaces',
      icon: (
        <RoundedImage
          size='sm'
          alt={team.name}
          url={team.icon != null ? buildIconUrl(team.icon.location) : undefined}
        />
      ),
      onClick: () => openState('spaces'),
    })
  }
  rows.push({
    tooltip: 'Tree',
    active: sidebarState === 'tree',
    icon: mdiFileDocumentMultipleOutline,
    onClick: () => openState('tree'),
  })
  rows.push({
    tooltip: 'Search',
    active: sidebarState === 'search',
    icon: mdiMagnify,
    onClick: () => openState('search'),
  })
  rows.push({
    tooltip: 'Timeline',
    active: sidebarState === 'timeline',
    icon: mdiClockOutline,
    onClick: () => openState('timeline'),
  })
  rows.push({
    tooltip: 'Import',
    icon: mdiDownload,
    position: 'bottom',
    onClick: () => openModal(<ImportModal />),
  })
  rows.push({
    tooltip: 'Members',
    active: sidebarState === 'members',
    icon: mdiAccountMultiplePlusOutline,
    position: 'bottom',
    onClick: () => openState('members'),
  })
  rows.push({
    tooltip: 'Settings',
    active: sidebarState === 'settings',
    icon: mdiCogOutline,
    position: 'bottom',
    onClick: () => openState('settings'),
  })

  return rows
}

function mapSpaces(
  navigateToTeam: (
    team: SerializedTeam,
    intent: TeamLinkIntent,
    query?: any
  ) => void,
  push: (url: Url) => void,
  teams: SerializedTeam[],
  invites: SerializedTeamInvite[],
  team?: SerializedTeam
) {
  const rows: SidebarSpace[] = []
  teams.forEach((globalTeam) => {
    rows.push({
      label: globalTeam.name,
      active: team?.id === globalTeam.id,
      icon:
        globalTeam.icon != null
          ? buildIconUrl(globalTeam.icon.location)
          : undefined,
      linkProps: {
        href: `${process.env.BOOST_HUB_BASE_URL}${getTeamURL(globalTeam)}`,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          navigateToTeam(globalTeam, 'index')
        },
      },
    })
  })

  invites.forEach((invite) => {
    const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
    rows.push({
      label: `${invite.team.name} (invited)`,
      icon:
        invite.team.icon != null
          ? buildIconUrl(invite.team.icon.location)
          : undefined,
      linkProps: {
        href: `${process.env.BOOST_HUB_BASE_URL}/invite?${stringify(query)}`,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(`/invite?${stringify(query)}`)
        },
      },
    })
  })

  return rows
}

function buildSpacesBottomRows(push: (url: Url) => void) {
  return [
    {
      label: 'Create an account',
      icon: mdiPlusCircleOutline,
      linkProps: {
        href: `${process.env.BOOST_HUB_BASE_URL}/cooperate`,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(`/cooperate`)
        },
      },
    },
    {
      label: 'Download desktop app',
      icon: mdiDownload,
      linkProps: {
        href: 'https://github.com/BoostIO/BoostNote.next/releases/latest',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    },
    {
      label: 'Log out',
      icon: mdiLogoutVariant,
      linkProps: {
        href: '/api/oauth/signout',
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          if (usingElectron) {
            sendToHost('sign-out')
          } else {
            window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout`
          }
        },
      },
    },
  ]
}

function buildChildrenNavRows(
  childrenIds: string[],
  depth: number,
  map: Map<string, CloudTreeItem>
) {
  const rows = childrenIds.reduce((acc, childId) => {
    const childRow = map.get(childId)
    if (childRow == null) {
      acc.push({
        id: childId,
        label: '...',
        depth,
      })
      return acc
    }

    acc.push({
      ...childRow,
      depth,
      rows: buildChildrenNavRows(childRow.children, depth + 1, map),
    })

    return acc
  }, [] as SidebarTreeChildRow[])
  return rows
}

type CloudTreeItem = {
  id: string
  parentId?: string
  label: string
  defaultIcon?: string
  emoji?: string
  bookmarked?: boolean
  archived?: boolean
  children: string[]
  folding?: FoldingProps
  folded?: boolean
  href?: string
  navigateTo?: () => void
}

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
import { buildIconUrl } from '../../../../cloud/api/files'
import { useNavigateToTeam } from '../../../../cloud/components/atoms/Link/TeamLink'
import ImportModal from '../../../../cloud/components/organisms/Modal/contents/Import/ImportModal'
import { useRouter } from '../../../../cloud/lib/router'
import { useGlobalData } from '../../../../cloud/lib/stores/globalData'
import { useModal } from '../../../../cloud/lib/stores/modal'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { getHexFromUUID } from '../../../../cloud/lib/utils/string'
import { SidebarState } from '../../../../lib/v2/sidebar'
import RoundedImage from '../../atoms/RoundedImage'
import ApplicationLayout from '../../templates/ApplicationLayout'
import {
  usingElectron,
  sendToHost,
} from '../../../../cloud/lib/stores/electron'
import {
  getDocId,
  getDocTitle,
  getFolderId,
  getTeamURL,
} from '../../../../cloud/lib/utils/patterns'
import { useNav } from '../../../../cloud/lib/stores/nav'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../../../../cloud/lib/stores/sidebarCollapse'
import { SidebarSpace } from '../../organisms/Sidebar/molecules/SidebarSpacesPicker'
import { SidebarContextRow } from '../../organisms/Sidebar/molecules/SidebarContext'
import {
  SidebarNavCategory,
  SidebarTreeChildRow,
} from '../../organisms/Sidebar/molecules/SidebarTree'
import { getMapValues } from '../../../../lib/v2/utils/array'
import { FoldingProps } from '../../organisms/Sidebar/atoms/SidebarTreeItem'
import {
  MenuTypes,
  useContextMenu,
} from '../../../../cloud/lib/stores/contextMenu'
import Modal from '../../../../cloud/components/organisms/Modal'
import ContextMenu from '../../../../cloud/components/molecules/ContextMenu'
import EmojiPicker from '../../../../cloud/components/molecules/EmojiPicker'
import Dialog from '../../../../cloud/components/molecules/Dialog/Dialog'
import ToastList from '../../../../cloud/components/molecules/Toast'
import Checkbox from '../../atoms/Checkbox'

const ApplicationPage: React.FC<{}> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )
  const { team } = usePage()
  const {
    globalData: { teams, invites },
  } = useGlobalData()
  const navigateToTeam = useNavigateToTeam()
  const { openModal } = useModal()
  const { preferences, setPreferences } = usePreferences()
  const { push } = useRouter()
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

  const sidebarResize = useCallback(
    (leftWidth: number) => {
      setPreferences({
        sideBarWidth: leftWidth,
      })
    },
    [setPreferences]
  )

  const spaceBottomRows = useMemo(() => {
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
  }, [push])

  const spaces: SidebarSpace[] = useMemo(() => {
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
  }, [navigateToTeam, teams, team, invites, push])

  const openContext = useCallback((state: SidebarState) => {
    setSidebarState((prev) => (prev === state ? undefined : state))
  }, [])

  const contextRows: SidebarContextRow[] = useMemo(() => {
    const rows: SidebarContextRow[] = []
    if (team != null) {
      rows.push({
        tooltip: 'Spaces',
        active: sidebarState === 'spaces',
        icon: (
          <RoundedImage
            size='sm'
            alt={team.name}
            url={
              team.icon != null ? buildIconUrl(team.icon.location) : undefined
            }
          />
        ),
        onClick: () => openContext('spaces'),
      })
    }
    rows.push({
      tooltip: 'Tree',
      active: sidebarState === 'tree',
      icon: mdiFileDocumentMultipleOutline,
      onClick: () => openContext('tree'),
    })
    rows.push({
      tooltip: 'Search',
      active: sidebarState === 'search',
      icon: mdiMagnify,
      onClick: () => openContext('search'),
    })
    rows.push({
      tooltip: 'Timeline',
      active: sidebarState === 'timeline',
      icon: mdiClockOutline,
      onClick: () => openContext('timeline'),
    })
    rows.push({
      tooltip: 'Import',
      icon: mdiDownload,
      position: 'bottom',
      onClick: () =>
        openModal(<ImportModal />, {
          classNames: 'largeW',
        }),
    })
    rows.push({
      tooltip: 'Members',
      active: sidebarState === 'members',
      icon: mdiAccountMultiplePlusOutline,
      position: 'bottom',
      onClick: () => openContext('members'),
    })
    rows.push({
      tooltip: 'Settings',
      active: sidebarState === 'settings',
      icon: mdiCogOutline,
      position: 'bottom',
      onClick: () => openContext('settings'),
    })

    return rows
  }, [sidebarState, openModal, team, openContext])

  const docsPerTagIdMap = useMemo(() => {
    return [...docsMap.values()].reduce((acc, doc) => {
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
  }, [docsMap])

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

  const tree = useMemo(() => {
    if (!initialLoadDone) {
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
        parentId:
          folder.parentFolderId == null
            ? folder.workspaceId
            : folder.parentFolderId,
        children:
          typeof folder.positions != null &&
          typeof folder.positions !== 'string'
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
  }, [
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    docsPerTagIdMap,
    sideBarOpenedLinksIdsSet,
    sideBarOpenedFolderIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    toggleItem,
    getFoldEvents,
  ])

  const { popup } = useContextMenu()
  const treeControls = useMemo(() => {
    if (tree == null || tree.length === 0) {
      return undefined
    }

    return [
      {
        icon: mdiDotsHorizontal,
        onClick: (event: React.MouseEvent) =>
          popup(
            event,
            tree.map((category) => {
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
  }, [popup, tree])

  return (
    <ApplicationLayout
      sidebarState={sidebarState}
      contextRows={contextRows}
      spaces={spaces}
      spaceBottomRows={spaceBottomRows}
      sidebarResize={sidebarResize}
      sidebarExpandedWidth={preferences.sideBarWidth}
      tree={tree}
      treeControls={treeControls}
    >
      <Modal />
      <ToastList />
      <ContextMenu />
      <EmojiPicker />
      <Dialog />
      {children}
    </ApplicationLayout>
  )
}

export default ApplicationPage

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
}

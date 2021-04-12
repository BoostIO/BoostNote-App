import React, {
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  useMemo,
} from 'react'
import { usePreferences } from '../lib/stores/preferences'
import { usePage } from '../lib/stores/pageStore'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  isSingleKeyEvent,
} from '../lib/keyboard'
import { isActiveElementAnInput, InputableDomElement } from '../lib/dom'
import { useDebounce, useEffectOnce } from 'react-use'
import { useModal } from '../lib/stores/modal'
import { SettingsTab, useSettings } from '../lib/stores/settings'
import { shortcuts } from '../lib/shortcuts'
import CreateFolderModal from './organisms/Modal/contents/Folder/CreateFolderModal'
import { useSearch } from '../lib/stores/search'
import AnnouncementAlert from './atoms/AnnouncementAlert'
import { newFolderEventEmitter, searchEventEmitter } from '../lib/utils/events'
import { useRouter } from '../lib/router'
import { useNav } from '../lib/stores/nav'
import EventSource from '../../components/v2/organisms/cloud/EventSource'
import ApplicationLayout from '../../components/v2/molecules/ApplicationLayout'
import Sidebar from '../../components/v2/organisms/Sidebar'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../lib/stores/sidebarCollapse'
import {
  MenuItem,
  MenuTypes,
  useContextMenu,
} from '../../lib/v2/stores/contextMenu'
import { useGlobalData } from '../lib/stores/globalData'
import { getDocLinkHref } from './atoms/Link/DocLink'
import { getFolderHref } from './atoms/Link/FolderLink'
import { getWorkspaceHref } from './atoms/Link/WorkspaceLink'
import { getTagHref } from './atoms/Link/TagLink'
import {
  SidebarSearchHistory,
  SidebarSearchResult,
} from '../../components/v2/organisms/Sidebar/molecules/SidebarSearch'
import { SidebarState } from '../../lib/v2/sidebar'
import useApi from '../../lib/v2/hooks/useApi'
import {
  GetSearchResultsRequestQuery,
  getSearchResultsV2,
  HistoryItem,
  SearchResult,
} from '../api/search'
import { SidebarToolbarRow } from '../../components/v2/organisms/Sidebar/molecules/SidebarToolbar'
import { mapUsers } from '../../lib/v2/mappers/users'
import { SerializedDoc, SerializedDocWithBookmark } from '../interfaces/db/doc'
import { SerializedTeam } from '../interfaces/db/team'
import { compareDateString } from '../../lib/v2/date'
import {
  getDocId,
  getDocTitle,
  getFolderId,
  getTeamURL,
} from '../lib/utils/patterns'
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
import { getColorFromString } from '../../lib/v2/string'
import { buildIconUrl } from '../api/files'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../interfaces/db/folder'
import { SerializedWorkspace } from '../interfaces/db/workspace'
import { SerializedTag } from '../interfaces/db/tag'
import { FoldingProps } from '../../components/v2/atoms/FoldingWrapper'
import { getMapValues } from '../../lib/v2/utils/array'
import {
  SidebarNavCategory,
  SidebarTreeChildRow,
} from '../../components/v2/organisms/Sidebar/molecules/SidebarTree'
import Checkbox from '../../components/v2/molecules/Form/atoms/FormCheckbox'
import RoundedImage from '../../components/v2/atoms/RoundedImage'
import ImportModal from './organisms/Modal/contents/Import/ImportModal'
import { SerializedTeamInvite } from '../interfaces/db/teamInvite'
import { getHexFromUUID } from '../lib/utils/string'
import { stringify } from 'querystring'
import { sendToHost, usingElectron } from '../lib/stores/electron'
import { SidebarSpace } from '../../components/v2/organisms/Sidebar/molecules/SidebarSpaces'
import ContentLayout, {
  ContentLayoutProps,
} from '../../components/v2/templates/ContentLayout'
import { getTeamLinkHref } from './atoms/Link/TeamLink'

interface ApplicationProps {
  content: ContentLayoutProps
  className?: string
  style?: CSSProperties
  maxLeftWidth?: number
}

const Application = ({
  content,
  children,
}: React.PropsWithChildren<ApplicationProps>) => {
  const { preferences, setPreferences } = usePreferences()
  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
    currentParentFolderId,
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
  const {
    team,
    permissions = [],
    guestsMap,
    currentUserPermissions,
  } = usePage()
  const { openModal } = useModal()
  const {
    globalData: { teams, invites, currentUser },
  } = useGlobalData()
  const { push, query } = useRouter()
  const { history, searchHistory, addToSearchHistory } = useSearch()
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SidebarSearchResult[]>([])
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )
  const { openSettingsTab } = useSettings()

  useEffectOnce(() => {
    if (query.settings === 'upgrade') {
      openSettingsTab('teamUpgrade')
    }
  })

  useEffect(() => {
    const handler = () => {
      if (sidebarState === 'search') {
        setSidebarState(undefined)
      } else {
        setSidebarState('search')
      }
    }
    searchEventEmitter.listen(handler)
    return () => {
      searchEventEmitter.unlisten(handler)
    }
  }, [sidebarState])

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
      push,
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
    push,
    team,
  ])

  const users = useMemo(() => {
    return mapUsers(permissions, currentUser, [...guestsMap.values()])
  }, [permissions, currentUser, guestsMap])

  const treeControls = useMemo(() => {
    return mapTreeControls(tree || [], popup)
  }, [popup, tree])

  const toolbarRows: SidebarToolbarRow[] = useMemo(() => {
    return mapToolbarRows(
      openState,
      openModal,
      openSettingsTab,
      sidebarState,
      team
    )
  }, [sidebarState, openModal, openSettingsTab, team, openState])

  const spaces = useMemo(() => {
    return mapSpaces(push, teams, invites, team)
  }, [teams, team, invites, push])

  const historyItems = useMemo(() => {
    return mapHistory(history, push, docsMap, foldersMap, team)
  }, [team, history, push, docsMap, foldersMap])

  const setSearchQuery = useCallback((val: string) => {
    setSidebarSearchQuery(val)
  }, [])

  const { submit: submitSearch, sending: fetchingSearchResults } = useApi({
    api: ({ teamId, query }: { teamId: string; query: any }) =>
      getSearchResultsV2({ teamId, query }),
    cb: ({ results }) =>
      setSearchResults(mapSearchResults(results, push, team)),
  })

  const [isNotDebouncing, cancel] = useDebounce(
    async () => {
      if (team == null || sidebarSearchQuery.trim() === '') {
        return
      }

      if (fetchingSearchResults) {
        cancel()
      }

      const searchParams = sidebarSearchQuery
        .split(' ')
        .reduce<GetSearchResultsRequestQuery>(
          (params, str) => {
            if (str === '--body') {
              params.body = true
              return params
            }
            if (str === '--title') {
              params.title = true
              return params
            }
            params.query = params.query == '' ? str : `${params.query} ${str}`
            return params
          },
          { query: '' }
        )

      addToSearchHistory(searchParams.query)
      await submitSearch({ teamId: team.id, query: searchParams })
    },
    600,
    [sidebarSearchQuery]
  )

  const timelineRows = useMemo(() => {
    return mapTimelineItems([...docsMap.values()], push, team)
  }, [docsMap, push, team])

  const openCreateFolderModal = useCallback(() => {
    openModal(<CreateFolderModal parentFolderId={currentParentFolderId} />)
  }, [openModal, currentParentFolderId])

  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      return
    }
    newFolderEventEmitter.listen(openCreateFolderModal)
    return () => {
      newFolderEventEmitter.unlisten(openCreateFolderModal)
    }
  }, [team, currentUserPermissions, openCreateFolderModal])

  const overrideBrowserCtrlsHandler = useCallback(
    async (event: KeyboardEvent) => {
      if (team == null) {
        return
      }

      if (isSingleKeyEventOutsideOfInput(event, shortcuts.teamMembers)) {
        preventKeyboardEventPropagation(event)
        openSettingsTab('teamMembers')
      }

      if (isSingleKeyEvent(event, 'escape') && isActiveElementAnInput()) {
        if (isCodeMirorTextAreaEvent(event)) {
          return
        }
        preventKeyboardEventPropagation(event)
        ;(document.activeElement as InputableDomElement).blur()
      }
    },
    [openSettingsTab, team]
  )
  useGlobalKeyDownHandler(overrideBrowserCtrlsHandler)

  return (
    <>
      {team != null && <EventSource teamId={team.id} />}
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
            searchQuery={sidebarSearchQuery}
            setSearchQuery={setSearchQuery}
            searchHistory={searchHistory}
            recentPages={historyItems}
            searchResults={searchResults}
            users={users}
            timelineRows={timelineRows}
            timelineMore={
              team != null
                ? {
                    variant: 'primary',
                    onClick: () => push(getTeamLinkHref(team, 'timeline')),
                  }
                : undefined
            }
            sidebarSearchState={{
              fetching: fetchingSearchResults,
              isNotDebouncing: isNotDebouncing() === true,
            }}
          />
        }
        pageBody={
          <>
            <ContentLayout {...content}>{children}</ContentLayout>
          </>
        }
      />
      <AnnouncementAlert />
    </>
  )
}

export default Application

function mapTimelineItems(
  docs: SerializedDoc[],
  push: (url: string) => void,
  team?: SerializedTeam,
  limit = 10
) {
  if (team == null) {
    return []
  }

  return docs
    .sort((a, b) =>
      compareDateString(
        a.head?.created || a.updatedAt,
        b.head?.created || b.updatedAt,
        'DESC'
      )
    )
    .slice(0, limit)
    .map((doc) => {
      const labelHref = getDocLinkHref(doc, team, 'index')
      return {
        id: doc.id,
        label: getDocTitle(doc, 'Untitled'),
        labelHref,
        labelOnClick: () => push(labelHref),
        emoji: doc.emoji,
        defaultIcon: mdiFileDocumentOutline,
        lastUpdated: doc.head?.created || doc.updatedAt,
        lastUpdatedBy:
          doc.head == null
            ? []
            : doc.head.creators.map((user) => {
                return {
                  color: getColorFromString(user.id),
                  userId: user.id,
                  name: user.displayName,
                  iconUrl:
                    user.icon != null
                      ? buildIconUrl(user.icon.location)
                      : undefined,
                }
              }),
      }
    })
}

function mapSearchResults(
  results: SearchResult[],
  push: (url: string) => void,
  team?: SerializedTeam
) {
  if (team == null) {
    return []
  }

  return results.reduce((acc, item) => {
    if (item.type === 'folder') {
      const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        item.result,
        team,
        'index'
      )}`
      acc.push({
        label: item.result.name,
        href,
        emoji: item.result.emoji,
        onClick: () => push(href),
      })
      return acc
    }

    const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
      item.result,
      team,
      'index'
    )}`
    acc.push({
      label: getDocTitle(item.result, 'Untitled'),
      href,
      defaultIcon: mdiFileDocumentOutline,
      emoji: item.result.emoji,
      contexts: item.type === 'docContent' ? [item.context] : undefined,
      onClick: () => push(href),
    })
    return acc
  }, [] as SidebarSearchResult[])
}

function mapHistory(
  history: HistoryItem[],
  push: (href: string) => void,
  docsMap: Map<string, SerializedDoc>,
  foldersMap: Map<string, SerializedFolder>,
  team?: SerializedTeam
) {
  if (team == null) {
    return []
  }

  const items = [] as SidebarSearchHistory[]

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
          defaultIcon: mdiFileDocumentOutline,
          label: getDocTitle(item, 'Untitled'),
          href,
          onClick: () => push(href),
        })
      }
    }
  })

  return items
}

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
  push: (url: string) => void,
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
    const href = `${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
      wp,
      team,
      'index'
    )}`
    items.set(wp.id, {
      id: wp.id,
      label: wp.name,
      defaultIcon: !wp.public ? mdiLock : undefined,
      children: wp.positions?.orderedIds || [],
      folded: !sideBarOpenedWorkspaceIdsSet.has(wp.id),
      folding: getFoldEvents('workspaces', wp.id),
      href,
      navigateTo: () => push(href),
    })
  })

  folders.forEach((folder) => {
    const folderId = getFolderId(folder)
    const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
      folder,
      team,
      'index'
    )}`
    items.set(folderId, {
      id: folderId,
      label: folder.name,
      bookmarked: folder.bookmarked,
      emoji: folder.emoji,
      folded: !sideBarOpenedFolderIdsSet.has(folder.id),
      folding: getFoldEvents('folders', folder.id),
      href,
      navigateTo: () => push(href),
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
    const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
      doc,
      team,
      'index'
    )}`
    items.set(docId, {
      id: docId,
      label: getDocTitle(doc, 'Untitled'),
      bookmarked: doc.bookmarked,
      emoji: doc.emoji,
      defaultIcon: mdiFileDocumentOutline,
      archived: doc.archivedAt != null,
      children: [],
      href,
      navigateTo: () => push(href),
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
      const href = `${process.env.BOOST_HUB_BASE_URL}${getTagHref(
        val,
        team,
        'index'
      )}`
      acc.push({
        id: val.id,
        depth: 0,
        label: val.text,
        defaultIcon: mdiTag,
        href,
        navigateTo: () => push(href),
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
  openModal: (cmp: JSX.Element, options?: any) => void,
  openSettingsTab: (tab: SettingsTab) => void,
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
    onClick: () => openSettingsTab('teamMembers'),
  })
  rows.push({
    tooltip: 'Settings',
    active: sidebarState === 'settings',
    icon: mdiCogOutline,
    position: 'bottom',
    onClick: () => openSettingsTab('preferences'),
  })

  return rows
}

function mapSpaces(
  push: (url: string) => void,
  teams: SerializedTeam[],
  invites: SerializedTeamInvite[],
  team?: SerializedTeam
) {
  const rows: SidebarSpace[] = []
  teams.forEach((globalTeam) => {
    const href = `${process.env.BOOST_HUB_BASE_URL}${getTeamURL(globalTeam)}`
    rows.push({
      label: globalTeam.name,
      active: team?.id === globalTeam.id,
      icon:
        globalTeam.icon != null
          ? buildIconUrl(globalTeam.icon.location)
          : undefined,
      linkProps: {
        href,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(href)
        },
      },
    })
  })

  invites.forEach((invite) => {
    const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
    const href = `${process.env.BOOST_HUB_BASE_URL}/invite?${stringify(query)}`
    rows.push({
      label: `${invite.team.name} (invited)`,
      icon:
        invite.team.icon != null
          ? buildIconUrl(invite.team.icon.location)
          : undefined,
      linkProps: {
        href,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(`/invite?${stringify(query)}`)
        },
      },
    })
  })

  return rows
}

function buildSpacesBottomRows(push: (url: string) => void) {
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


function isCodeMirorTextAreaEvent(event: KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement
  if (target == null || target.tagName.toLowerCase() !== 'textarea') {
    return false
  }
  const classNameOfParentParentElement =
    target.parentElement?.parentElement?.className
  if (classNameOfParentParentElement == null) {
    return false
  }
  if (!/CodeMirror/.test(classNameOfParentParentElement)) {
    return false
  }

  return true
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { usePreferences } from '../lib/stores/preferences'
import { usePage } from '../lib/stores/pageStore'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  isSingleKeyEvent,
} from '../lib/keyboard'
import { isActiveElementAnInput, InputableDomElement } from '../lib/dom'
import { useEffectOnce } from 'react-use'
import { useSettings } from '../lib/stores/settings'
import {
  isPageSearchShortcut,
  isSidebarToggleShortcut,
  shortcuts,
} from '../lib/shortcuts'
import { useSearch } from '../lib/stores/search'
import AnnouncementAlert from './AnnouncementAlert'
import {
  newFolderEventEmitter,
  searchEventEmitter,
  toggleSidebarSearchEventEmitter,
  toggleSidebarNotificationsEventEmitter,
  newDocEventEmitter,
  switchSpaceEventEmitter,
  SwitchSpaceEventDetails,
} from '../lib/utils/events'
import { usePathnameChangeEffect, useRouter } from '../lib/router'
import { useNav } from '../lib/stores/nav'
import EventSource from './EventSource'
import ApplicationLayout from '../../design/components/molecules/ApplicationLayout'
import { useGlobalData } from '../lib/stores/globalData'
import { mapUsers } from '../../design/lib/mappers/users'
import {
  mdiCog,
  mdiDownload,
  mdiGiftOutline,
  mdiInbox,
  mdiLogoutVariant,
  mdiMagnify,
  mdiPlusCircleOutline,
  mdiWeb,
} from '@mdi/js'
import { buildIconUrl } from '../api/files'
import { useElectron, usingElectron } from '../lib/stores/electron'
import cc from 'classcat'
import { useCloudResourceModals } from '../lib/hooks/useCloudResourceModals'
import FuzzyNavigation from '../../design/components/organisms/FuzzyNavigation'
import {
  mapFuzzyNavigationItems,
  mapFuzzyNavigationRecentItems,
} from '../lib/mappers/fuzzyNavigation'
import { useModal } from '../../design/lib/stores/modal'
import NewDocButton from './buttons/NewDocButton'
import { useCloudSidebarTree } from '../lib/hooks/sidebar/useCloudSidebarTree'
import { isTimeEligibleForDiscount } from '../lib/subscription'
import DiscountModal from './Modal/contents/DiscountModal'
import { Notification as UserNotification } from '../interfaces/db/notifications'
import useNotificationState from '../../design/lib/hooks/useNotificationState'
import { useNotifications } from '../../design/lib/stores/notifications'
import '../lib/i18n'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import Sidebar, {
  PopOverState,
} from '../../design/components/organisms/Sidebar'
import SidebarHeader from '../../design/components/organisms/Sidebar/atoms/SidebarHeader'
import SidebarButtonList from '../../design/components/organisms/Sidebar/molecules/SidebarButtonList'
import NotifyIcon from '../../design/components/atoms/NotifyIcon'
import { getTeamLinkHref } from './Link/TeamLink'
import SidebarButton from '../../design/components/organisms/Sidebar/atoms/SidebarButton'
import CloudGlobalSearch from './CloudGlobalSearch'
import { useCloudSidebarSpaces } from '../lib/hooks/sidebar/useCloudSidebarSpaces'
import { trackEvent } from '../api/track'
import { MixpanelActionTrackTypes } from '../interfaces/analytics/mixpanel'
import {
  InPageSearch,
  InPageSearchContainer,
} from './molecules/PageSearch/InPageSearchPortal'
import SidebarToggleButton from './SidebarToggleButton'

interface ApplicationProps {
  className?: string
}

const Application = ({
  children,
}: React.PropsWithChildren<ApplicationProps>) => {
  const { preferences, setPreferences } = usePreferences()
  const {
    docsMap,
    foldersMap,
    workspacesMap,
    currentParentFolderId,
    currentWorkspaceId,
    currentPath,
  } = useNav()
  const {
    team,
    permissions = [],
    currentUserPermissions,
    currentUserIsCoreMember,
    subscription,
  } = usePage()
  const { openModal } = useModal()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { push, query, pathname } = useRouter()
  const [popOverState, setPopOverState] = useState<PopOverState>(null)
  const { openSettingsTab, closeSettingsTab } = useSettings()
  const { openNewDocForm, openNewFolderForm } = useCloudResourceModals()
  const [showFuzzyNavigation, setShowFuzzyNavigation] = useState(false)
  const {
    treeWithOrderedCategories,
    sidebarHeaderControls,
  } = useCloudSidebarTree()
  const { counts } = useNotifications()
  const { translate } = useI18n()
  const { sendToElectron } = useElectron()

  const { history, showSearchScreen, setShowSearchScreen } = useSearch()
  const [showInPageSearch, setShowInPageSearch] = useState(false)
  const [inPageSearchQuery, setInPageSearchQuery] = useState<string>('')

  usePathnameChangeEffect(() => {
    setShowFuzzyNavigation(false)
    setShowSearchScreen(false)
    closeSettingsTab()
  })

  useEffectOnce(() => {
    switch (query.settings) {
      case 'upgrade':
        return openSettingsTab('teamUpgrade')
      case 'members':
        return openSettingsTab('teamMembers')
      default:
        return
    }
  })

  useEffect(() => {
    const handler = () => {
      setShowFuzzyNavigation((prev) => !prev)
    }
    searchEventEmitter.listen(handler)
    return () => {
      searchEventEmitter.unlisten(handler)
    }
  }, [])

  const sidebarResize = useCallback(
    (width: number) => setPreferences({ sideBarWidth: width }),
    [setPreferences]
  )

  const users = useMemo(() => {
    return mapUsers(permissions, currentUser)
  }, [permissions, currentUser])

  const { spaces } = useCloudSidebarSpaces()

  useEffect(() => {
    const switchSpaceEventHandler = (
      event: CustomEvent<SwitchSpaceEventDetails>
    ) => {
      const targetSpace = spaces[event.detail.index]
      if (targetSpace == null) {
        console.warn('invalid space index')
        return
      }
      push(`${targetSpace.linkProps.href}`)
    }
    switchSpaceEventEmitter.listen(switchSpaceEventHandler)

    return () => {
      switchSpaceEventEmitter.unlisten(switchSpaceEventHandler)
    }
  }, [spaces, push])

  const openCreateFolderModal = useCallback(() => {
    openNewFolderForm({
      team,
      workspaceId: currentWorkspaceId,
      parentFolderId: currentParentFolderId,
    })
  }, [openNewFolderForm, currentParentFolderId, team, currentWorkspaceId])

  const openCreateDocModal = useCallback(() => {
    openNewDocForm(
      {
        team,
        parentFolderId: currentParentFolderId,
        workspaceId: currentWorkspaceId,
      },
      {
        precedingRows: [
          {
            description: `${
              workspacesMap.get(currentWorkspaceId || '')?.name
            }${currentPath}`,
          },
        ],
      }
    )
  }, [
    openNewDocForm,
    team,
    currentParentFolderId,
    currentWorkspaceId,
    workspacesMap,
    currentPath,
  ])

  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      return
    }
    newDocEventEmitter.listen(openCreateDocModal)
    newFolderEventEmitter.listen(openCreateFolderModal)
    return () => {
      newFolderEventEmitter.unlisten(openCreateFolderModal)
      newDocEventEmitter.unlisten(openCreateDocModal)
    }
  }, [team, currentUserPermissions, openCreateFolderModal, openCreateDocModal])

  const overrideBrowserCtrlsHandler = useCallback(
    async (event: KeyboardEvent) => {
      if (team == null) {
        return
      }

      if (isSidebarToggleShortcut(event)) {
        preventKeyboardEventPropagation(event)
        setPreferences((prev) => {
          return { sidebarIsHidden: !prev.sidebarIsHidden }
        })
      }

      if (isSingleKeyEventOutsideOfInput(event, shortcuts.teamMembers)) {
        preventKeyboardEventPropagation(event)
        openSettingsTab('teamMembers')
      }

      if (isSingleKeyEvent(event, 'escape') && isActiveElementAnInput()) {
        if (isCodeMirrorTextAreaEvent(event)) {
          return
        }
        preventKeyboardEventPropagation(event)
        ;(document.activeElement as InputableDomElement).blur()
      }

      if (usingElectron && isPageSearchShortcut(event)) {
        preventKeyboardEventPropagation(event)
        if (showInPageSearch) {
          setShowInPageSearch(false)
          setShowInPageSearch(true)
        } else {
          setShowInPageSearch(true)
        }
      }
    },
    [team, setPreferences, openSettingsTab, showInPageSearch]
  )
  useGlobalKeyDownHandler(overrideBrowserCtrlsHandler)

  const toggleSidebarSearch = useCallback(() => {
    closeSettingsTab()
    setShowSearchScreen((prev) => !prev)
  }, [closeSettingsTab, setShowSearchScreen])

  useEffect(() => {
    toggleSidebarSearchEventEmitter.listen(toggleSidebarSearch)
    return () => {
      toggleSidebarSearchEventEmitter.unlisten(toggleSidebarSearch)
    }
  }, [toggleSidebarSearch])

  useEffect(() => {
    const handler = () =>
      setPopOverState((prev) =>
        prev !== 'notifications' ? 'notifications' : null
      )
    toggleSidebarNotificationsEventEmitter.listen(handler)
    return () => toggleSidebarNotificationsEventEmitter.unlisten(handler)
  }, [])

  const onSpacesBlurCallback = useCallback(() => {
    setPopOverState(null)
  }, [])

  const spaceBottomRows = useMemo(() => {
    const bottomRows: {
      label: string
      icon: string
      linkProps: React.AnchorHTMLAttributes<{}>
    }[] = [
      {
        label: translate(lngKeys.CreateNewSpace),
        icon: mdiPlusCircleOutline,
        linkProps: {
          href: `${process.env.BOOST_HUB_BASE_URL}/cooperate`,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            push(`/cooperate`)
          },
        },
      },
    ]

    if (!usingElectron) {
      bottomRows.push({
        label: translate(lngKeys.DownloadDesktopApp),
        icon: mdiDownload,
        linkProps: {
          href: 'https://github.com/BoostIO/BoostNote-App/releases/latest',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      })
    }
    bottomRows.push({
      label: translate(lngKeys.LogOut),
      icon: mdiLogoutVariant,
      linkProps: {
        href: '/api/oauth/signout',
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()

          if (usingElectron) {
            sendToElectron('sign-out-event')
            window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout?redirectTo=/desktop`
            return
          } else {
            window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout`
            return
          }
        },
      },
    })
    return bottomRows
  }, [push, sendToElectron, translate])

  const {
    state: notificationState,
    getMore: getMoreNotifications,
    setViewed,
  } = useNotificationState(team?.id)

  const notificationClick = useCallback(
    (notification: UserNotification) => {
      setPopOverState(null)
      setViewed(notification)
      push(notification.link)
    },
    [push, setViewed]
  )

  const onSpaceClick = useCallback(() => {
    setPopOverState('spaces')
  }, [])

  const sidebarHeader = useMemo(() => {
    return (
      <>
        <SidebarHeader
          onSpaceClick={onSpaceClick}
          spaceName={team != null ? team.name : '...'}
          spaceImage={
            team != null && team.icon != null
              ? buildIconUrl(team.icon.location)
              : undefined
          }
          controls={sidebarHeaderControls}
        />
        {team == null ? null : (
          <SidebarButtonList
            rows={[
              {
                label: translate(lngKeys.GeneralSearchVerb),
                icon: mdiMagnify,
                variant: 'transparent',
                labelClick: () => setShowSearchScreen((prev) => !prev),
                id: 'sidebar__button__search',
                active: showSearchScreen,
              },
              {
                label: translate(lngKeys.GeneralInbox),
                icon: mdiInbox,
                variant: 'transparent',
                labelClick: () => setPopOverState('notifications'),
                id: 'sidebar__button__inbox',
                pastille:
                  team != null && counts[team.id] ? counts[team.id] : undefined,
              },
              {
                label: translate(lngKeys.SidebarSettingsAndMembers),
                icon: mdiCog,
                variant: 'transparent',
                labelClick: () => {
                  openSettingsTab('teamMembers')
                  trackEvent(MixpanelActionTrackTypes.InviteFromSidenav)
                },
                id: 'sidebar__button__members',
              },
            ]}
          >
            {currentUserIsCoreMember && <NewDocButton team={team} />}
          </SidebarButtonList>
        )}
      </>
    )
  }, [
    counts,
    currentUserIsCoreMember,
    onSpaceClick,
    openSettingsTab,
    setShowSearchScreen,
    sidebarHeaderControls,
    team,
    translate,
    showSearchScreen,
  ])

  const sidebarFooter = useMemo(() => {
    if (team == null) {
      return null
    }
    return (
      <>
        <SidebarButtonList
          rows={[
            {
              label: translate(lngKeys.GeneralShared),
              icon: mdiWeb,
              variant: 'subtle',
              labelHref: getTeamLinkHref(team, 'shared'),
              active: getTeamLinkHref(team, 'shared') === pathname,
              labelClick: (event) => {
                const teamHref = getTeamLinkHref(team, 'shared')
                if (event && event.shiftKey && usingElectron) {
                  const loadUrl = `${process.env.BOOST_HUB_BASE_URL}${teamHref}`
                  sendToElectron('new-window', loadUrl)
                  return
                }
                push(teamHref)
              },
              id: 'sidebar__button__shared',
            },
          ]}
        >
          {isTimeEligibleForDiscount(team) && subscription == null ? (
            <SidebarButton
              variant='subtle'
              icon={<NotifyIcon text='!' size={16} path={mdiGiftOutline} />}
              id='sidebar__button__promo'
              label={translate(lngKeys.SidebarNewUserDiscount)}
              labelClick={() => {
                trackEvent(MixpanelActionTrackTypes.DiscountSidebar)
                return openModal(<DiscountModal />, {
                  showCloseIcon: true,
                  width: 'large',
                })
              }}
            />
          ) : null}
        </SidebarButtonList>
      </>
    )
  }, [team, translate, pathname, subscription, push, sendToElectron, openModal])

  return (
    <>
      {team != null && <EventSource teamId={team.id} />}
      {showFuzzyNavigation && team != null && (
        <FuzzyNavigation
          close={() => setShowFuzzyNavigation(false)}
          allItems={mapFuzzyNavigationItems(
            team,
            push,
            docsMap,
            foldersMap,
            workspacesMap
          )}
          recentItems={mapFuzzyNavigationRecentItems(
            team,
            history,
            push,
            docsMap,
            foldersMap,
            workspacesMap
          )}
        />
      )}
      <ApplicationLayout
        sidebar={
          <Sidebar
            className={cc(['application__sidebar'])}
            popOver={popOverState}
            onSpacesBlur={onSpacesBlurCallback}
            spaces={spaces}
            spaceBottomRows={spaceBottomRows}
            sidebarExpandedWidth={preferences.sideBarWidth}
            tree={treeWithOrderedCategories}
            sidebarResize={sidebarResize}
            header={sidebarHeader}
            treeBottomRows={sidebarFooter}
            users={users}
            notificationState={notificationState}
            getMoreNotifications={getMoreNotifications}
            notificationClick={notificationClick}
            hidden={preferences.sidebarIsHidden}
            hide={() => setPreferences({ sidebarIsHidden: true })}
          />
        }
        pageBody={
          <>
            {showSearchScreen ? <CloudGlobalSearch team={team} /> : children}
            {preferences.sidebarIsHidden && <SidebarToggleButton />}
          </>
        }
      />

      <AnnouncementAlert />
      {usingElectron && <InPageSearchContainer id={'inPageSearchContainer'} />}
      {showInPageSearch && (
        <InPageSearch
          searchQuery={inPageSearchQuery}
          onSearchQueryChange={setInPageSearchQuery}
          onSearchClose={() => setShowInPageSearch(false)}
        />
      )}
    </>
  )
}

export default Application

function isCodeMirrorTextAreaEvent(event: KeyboardEvent) {
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
}

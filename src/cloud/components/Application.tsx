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
import { shortcuts } from '../lib/shortcuts'
import { useSearch } from '../lib/stores/search'
import AnnouncementAlert from './atoms/AnnouncementAlert'
import {
  newFolderEventEmitter,
  searchEventEmitter,
  toggleSidebarSearchEventEmitter,
  toggleSidebarNotificationsEventEmitter,
  newDocEventEmitter,
} from '../lib/utils/events'
import { usePathnameChangeEffect, useRouter } from '../lib/router'
import { useNav } from '../lib/stores/nav'
import EventSource from './organisms/EventSource'
import ApplicationLayout from '../../shared/components/molecules/ApplicationLayout'
import { useGlobalData } from '../lib/stores/globalData'
import { mapUsers } from '../../shared/lib/mappers/users'
import {
  mdiCog,
  mdiDownload,
  mdiGiftOutline,
  mdiImport,
  mdiInbox,
  mdiLogoutVariant,
  mdiMagnify,
  mdiPaperclip,
  mdiPlusCircleOutline,
  mdiWeb,
} from '@mdi/js'
import { buildIconUrl } from '../api/files'
import { sendToHost, usingElectron } from '../lib/stores/electron'
import ContentLayout, {
  ContentLayoutProps,
} from '../../shared/components/templates/ContentLayout'
import cc from 'classcat'
import { useCloudResourceModals } from '../lib/hooks/useCloudResourceModals'
import { mapTopbarTree } from '../lib/mappers/topbarTree'
import FuzzyNavigation from '../../shared/components/organisms/FuzzyNavigation'
import {
  mapFuzzyNavigationItems,
  mapFuzzyNavigationRecentItems,
} from '../lib/mappers/fuzzyNavigation'
import { useModal } from '../../shared/lib/stores/modal'
import NewDocButton from './molecules/NewDocButton'
import { useCloudSidebarTree } from '../lib/hooks/sidebar/useCloudSidebarTree'
import { isTimeEligibleForDiscount } from '../lib/subscription'
import DiscountModal from './organisms/Modal/contents/DiscountModal'
import { Notification as UserNotification } from '../interfaces/db/notifications'
import useNotificationState from '../../shared/lib/hooks/useNotificationState'
import { useNotifications } from '../../shared/lib/stores/notifications'
import '../lib/i18n'
import { useI18n } from '../lib/hooks/useI18n'
import { TFunction } from 'i18next'
import { lngKeys } from '../lib/i18n/types'
import Sidebar, {
  PopOverState,
} from '../../shared/components/organisms/Sidebar'
import SidebarHeader from '../../shared/components/organisms/Sidebar/atoms/SidebarHeader'
import SidebarButtonList from '../../shared/components/organisms/Sidebar/molecules/SidebarButtonList'
import NotifyIcon from '../../shared/components/atoms/NotifyIcon'
import { getTeamLinkHref } from './atoms/Link/TeamLink'
import SidebarButton from '../../shared/components/organisms/Sidebar/atoms/SidebarButton'
import CloudGlobalSearch from './organisms/CloudGlobalSearch'
import ViewerDisclaimer from './molecules/ViewerDisclaimer'
import { useCloudSidebarSpaces } from '../lib/hooks/sidebar/useCloudSidebarSpaces'
import { trackEvent } from '../api/track'
import { MixpanelActionTrackTypes } from '../interfaces/analytics/mixpanel'

interface ApplicationProps {
  content: ContentLayoutProps
  className?: string
}

const Application = ({
  content: { topbar, ...content },
  children,
}: React.PropsWithChildren<ApplicationProps>) => {
  const { preferences, setPreferences } = usePreferences()
  const {
    initialLoadDone,
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
  const { push, query, goBack, goForward, pathname } = useRouter()
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

  const { history, showSearchScreen, setShowSearchScreen } = useSearch()

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

  const topbarTree = useMemo(() => {
    if (team == null) {
      return undefined
    }

    return mapTopbarTree(
      team,
      initialLoadDone,
      docsMap,
      foldersMap,
      workspacesMap,
      push
    )
  }, [team, initialLoadDone, docsMap, foldersMap, workspacesMap, push])

  const { spaces } = useCloudSidebarSpaces()

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
    },
    [openSettingsTab, team]
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

  const spaceBottomRows = useMemo(
    () => buildSpacesBottomRows(push, translate),
    [push, translate]
  )

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
              label: translate(lngKeys.GeneralAttachments),
              icon: mdiPaperclip,
              variant: 'subtle',
              labelClick: () => openSettingsTab('attachments'),
              id: 'sidebar__button__attachments',
            },
            {
              label: translate(lngKeys.GeneralShared),
              icon: mdiWeb,
              variant: 'subtle',
              labelHref: getTeamLinkHref(team, 'shared'),
              active: getTeamLinkHref(team, 'shared') === pathname,
              labelClick: () => push(getTeamLinkHref(team, 'shared')),
              id: 'sidebar__button__shared',
            },
            {
              label: translate(lngKeys.GeneralImport),
              icon: mdiImport,
              variant: 'subtle',
              labelClick: () => openSettingsTab('import'),
              id: 'sidebar__button__import',
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
        <ViewerDisclaimer />
      </>
    )
  }, [
    openModal,
    openSettingsTab,
    team,
    pathname,
    push,
    translate,
    subscription,
  ])

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
          />
        }
        pageBody={
          showSearchScreen ? (
            <CloudGlobalSearch team={team} />
          ) : (
            <ContentLayout
              {...content}
              topbar={{
                ...topbar,
                tree: topbarTree,
                navigation: {
                  goBack,
                  goForward,
                },
              }}
            >
              {children}
            </ContentLayout>
          )
        }
      />
      <AnnouncementAlert />
    </>
  )
}

export default Application

function buildSpacesBottomRows(push: (url: string) => void, t: TFunction) {
  return usingElectron
    ? [
        {
          label: t(lngKeys.CreateNewSpace),
          icon: mdiPlusCircleOutline,
          linkProps: {
            href: `${process.env.BOOST_HUB_BASE_URL}/cooperate`,
            onClick: (event: React.MouseEvent) => {
              event.preventDefault()
              sendToHost('new-space')
            },
          },
        },
        {
          label: t(lngKeys.LogOut),
          icon: mdiLogoutVariant,
          linkProps: {
            href: '/api/oauth/signout',
            onClick: (event: React.MouseEvent) => {
              event.preventDefault()
              sendToHost('sign-out')
            },
          },
        },
      ]
    : [
        {
          label: t(lngKeys.CreateNewSpace),
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
          label: t(lngKeys.DownloadDesktopApp),
          icon: mdiDownload,
          linkProps: {
            href: 'https://github.com/BoostIO/BoostNote.next/releases/latest',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
        {
          label: t(lngKeys.LogOut),
          icon: mdiLogoutVariant,
          linkProps: {
            href: '/api/oauth/signout',
            onClick: (event: React.MouseEvent) => {
              event.preventDefault()
              window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout`
            },
          },
        },
      ]
}

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

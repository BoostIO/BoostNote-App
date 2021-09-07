import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from '../lib/router'
import { ThemeProvider } from 'styled-components'
import { useGlobalData } from '../lib/stores/globalData'
import { getGlobalData } from '../api/global'
import { useEffectOnce } from 'react-use'
import nProgress from 'nprogress'
import AccountDeletePage from '../pages/account/delete'

import { SidebarCollapseProvider } from '../lib/stores/sidebarCollapse'
import { combineProviders } from '../lib/utils/context'
import { OnboardingProvider } from '../lib/stores/onboarding'
import { SettingsProvider, useSettings } from '../lib/stores/settings'

import { PreferencesProvider } from '../lib/stores/preferences'
import { SearchProvider } from '../lib/stores/search'
import { ExternalEntitiesProvider } from '../lib/stores/externalEntities'
import { PageDataProvider } from '../lib/stores/pageStore'

import { Mixpanel } from 'mixpanel-browser'
import * as intercom from '../lib/intercom'
import { intercomAppId } from '../lib/consts'

import GlobalStyleV2 from '../../design/components/atoms/GlobalStyle'
import CodeMirrorStyle from './CodeMirrorStyle'
import SettingsComponent from './settings/SettingsComponent'
import { GetInitialPropsParameters } from '../interfaces/pages'
import ResourceIndex from '../pages/[teamId]/[resourceId]'
import TeamIndex from '../pages/[teamId]'
import ErrorPage from './error/ErrorPage'
import { NavProvider } from '../lib/stores/nav'
import SharedDocsListPage from '../pages/[teamId]/shared'
import DeleteTeamPage from '../pages/[teamId]/delete'
import CooperatePage from '../pages/cooperate'
import { useRealtimeConn } from '../lib/stores/realtimeConn'
import SettingsPage from '../pages/settings'
import OpenInvitePage from '../pages/[teamId]/invite'
import TagsShowPage from '../pages/[teamId]/labels/[labelId]'
import SharedPage from '../pages/shared/[link]'
import { selectV2Theme } from '../../design/lib/styled/styleFunctions'
import { V2ToastProvider } from '../../design/lib/stores/toast'
import { V2EmojiProvider } from '../../design/lib/stores/emoji'
import { V2WindowProvider } from '../../design/lib/stores/window'
import { V2ContextMenuProvider } from '../../design/lib/stores/contextMenu'
import { V2ModalProvider } from '../../design/lib/stores/modal'
import { V2DialogProvider } from '../../design/lib/stores/dialog'
import Toast from '../../design/components/organisms/Toast'
import Dialog from '../../design/components/organisms/Dialog/Dialog'
import ContextMenu from '../../design/components/molecules/ContextMenu'
import WorkspaceShowPage from '../pages/[teamId]/workspaces/[workspaceId]'
import CloudModal from './CloudModal'
import { CommentsProvider } from '../lib/stores/comments'
import SmartFolderPage from '../pages/[teamId]/smart-folders/[smartFolderId]'
import EmojiPicker from '../../design/components/molecules/EmojiPicker'
import { NotificationsProvider } from '../../design/lib/stores/notifications'
import { TeamIntegrationsProvider } from '../../design/lib/stores/integrations'
import { TeamStorageProvider } from '../lib/stores/teamStorage'
import DenyRequestsPage from '../pages/[teamId]/requests/deny'
import styled from '../../design/lib/styled'
import { darkTheme } from '../../design/lib/styled/dark'
import Spinner from '../../design/components/atoms/Spinner'
import { TeamPreferencesProvider } from '../lib/stores/teamPreferences'
import Application from './Application'
import { BaseTheme } from '../../design/lib/styled/types'
import { BlocksProvider } from '../lib/stores/blocks'

const CombinedProvider = combineProviders(
  TeamStorageProvider,
  SidebarCollapseProvider,
  OnboardingProvider,
  PreferencesProvider,
  SettingsProvider,
  SearchProvider,
  ExternalEntitiesProvider,
  CommentsProvider,
  TeamPreferencesProvider
)

const V2CombinedProvider = combineProviders(
  V2ToastProvider,
  V2EmojiProvider,
  V2WindowProvider,
  V2ContextMenuProvider,
  V2ModalProvider,
  V2DialogProvider,
  CommentsProvider,
  NotificationsProvider,
  TeamIntegrationsProvider,
  BlocksProvider
)

interface PageInfo {
  Component: React.ComponentType<any>
  pageProps: any
  isError?: boolean
}

interface PageSpec {
  Component: React.ComponentType<any>
  getInitialProps?: ({
    pathname,
    search,
    signal,
  }: GetInitialPropsParameters) => Promise<any>
}

const Router = () => {
  const { pathname, search } = useRouter()
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const { connect } = useRealtimeConn()
  const previousPathnameRef = useRef<string | null>(null)
  const previousSearchRef = useRef<string | null>(null)

  const { initGlobalData, initialized, globalData } = useGlobalData()
  const { currentUser, realtimeAuth } = globalData

  useEffect(() => {
    if (realtimeAuth != null) {
      connect(process.env.REALTIME_URL as string, realtimeAuth)
    }
  }, [realtimeAuth, connect])

  useEffect(() => {
    if (currentUser == null) {
      return
    }
    const mixpanel = (window as any).mixpanel as Mixpanel

    if (mixpanel != null) {
      mixpanel.identify(currentUser.id)
      mixpanel.people.set({
        $first_name: currentUser.displayName,
        $last_name: '',
        $last_login: new Date(),
      })
    }

    if (intercomAppId != null) {
      intercom.boot(intercomAppId, {
        name: currentUser.displayName,
        user_id: currentUser.id,
      })
    }
  }, [currentUser])

  useEffectOnce(() => {
    if (intercomAppId == null) {
      return
    }
    intercom.load(intercomAppId)
    return () => {
      intercom.shutdown()
    }
  })

  useEffect(() => {
    if (
      previousPathnameRef.current === pathname &&
      previousSearchRef.current === search
    ) {
      return
    }
    console.info('navigate to ', pathname, search)
    previousPathnameRef.current = pathname
    previousSearchRef.current = search
    nProgress.start()

    const pageSpec = getPageComponent(pathname)
    if (pageSpec == null) {
      setPageInfo(null)
      nProgress.done()
      return
    }

    const abortController = new AbortController()
    if (pageSpec.getInitialProps != null) {
      Promise.all([
        initialized ? null : getGlobalData(),
        pageSpec.getInitialProps({
          pathname,
          search,
          signal: abortController.signal,
        }),
      ])
        .then(([globalData, pageData]) => {
          if (globalData != null) {
            initGlobalData(globalData)
          }
          setPageInfo({
            Component: pageSpec.Component,
            pageProps: pageData,
          })
          nProgress.done()
        })
        .catch((error: Error) => {
          if (error.name === 'AbortError') {
            console.warn('Navigation aborted')
            console.warn(error)
          } else {
            console.error(error)
            if (!initialized) {
              initGlobalData({
                teams: [],
                invites: [],
              })
            }

            setPageInfo({
              isError: true,
              Component: ErrorPage,
              pageProps: {
                error,
              },
            })
            nProgress.done()
          }
        })
    } else {
      setPageInfo({
        Component: pageSpec.Component,
        pageProps: {},
      })
      nProgress.done()
    }

    intercom.update()

    return () => {
      abortController.abort()
    }
    // Determine which page to show and how to fetch it

    // How to fetch does exist in get initial props so we need to determine the component
  }, [pathname, search, initialized, initGlobalData])

  if (!initialized) {
    return (
      <SettingsProvider>
        <V2ThemeProvider theme={darkTheme}>
          <LoadingScreen message='Fetching global data...' />
          <GlobalStyleV2 />
        </V2ThemeProvider>
      </SettingsProvider>
    )
  }
  if (pageInfo == null) {
    return (
      <SettingsProvider>
        <V2ThemeProvider theme={darkTheme}>
          <LoadingScreen message='Fetching page data...' />
          <GlobalStyleV2 />
        </V2ThemeProvider>
      </SettingsProvider>
    )
  }

  return (
    <PageDataProvider pageProps={pageInfo.pageProps as any}>
      <V2CombinedProvider>
        <CombinedProvider>
          <NavProvider pageProps={pageInfo.pageProps as any}>
            <V2ThemeProvider>
              {isApplicationPagePathname(pathname) && !pageInfo.isError ? (
                <Application>
                  <pageInfo.Component {...pageInfo.pageProps} />
                </Application>
              ) : (
                <pageInfo.Component {...pageInfo.pageProps} />
              )}

              <GlobalStyleV2 />
              <CodeMirrorStyle />
              <CloudModal />
              <Toast />
              <SettingsComponent />
              <ContextMenu />
              <EmojiPicker />
              <Dialog />
            </V2ThemeProvider>
          </NavProvider>
        </CombinedProvider>
      </V2CombinedProvider>
    </PageDataProvider>
  )
}

export default Router

interface LoadingScreenProps {
  message?: string
}

const LoadingScreenContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.primary};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .message {
    margin-left: 5px;
  }
`

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <LoadingScreenContainer>
      <Spinner />
      <p className='message'>{message == null ? 'Loading...' : message}</p>
    </LoadingScreenContainer>
  )
}

const V2ThemeProvider: React.FC<{ theme?: BaseTheme }> = ({
  children,
  theme,
}) => {
  const { settings } = useSettings()
  const { pathname } = useRouter()
  return (
    <ThemeProvider
      theme={
        theme != null
          ? theme
          : isHomepagePathname(pathname)
          ? darkTheme
          : selectV2Theme(settings['general.theme'])
      }
    >
      {children}
    </ThemeProvider>
  )
}

function isHomepagePathname(pathname: string) {
  if (pathname.startsWith('/integrations/')) {
    return true
  }
  if (pathname.startsWith('/shared/')) {
    return true
  }
  if (pathname.startsWith('/desktop/')) {
    return true
  }
  switch (pathname) {
    case '/':
    case '/features':
    case '/pricing':
    case '/integrations':
    case '/signin':
    case '/signup':
    case '/terms':
    case '/policy':
    case '/gdpr-policy':
    case '/shared':
    case '/desktop':
      return true
    default:
      return false
  }
}

function isApplicationPagePathname(pathname: string) {
  if (isHomepagePathname(pathname)) return false

  const [, ...splittedPathnames] = pathname.split('/')

  if (
    (splittedPathnames.length >= 2 &&
      splittedPathnames[0] === 'account' &&
      splittedPathnames[1] === 'delete') ||
    (splittedPathnames.length >= 1 &&
      ['account', 'cooperate', 'settings', 'shared'].includes(
        splittedPathnames[0]
      ))
  ) {
    return false
  }

  if (splittedPathnames.length >= 2 && splittedPathnames[1] === 'delete') {
    return false
  }

  return true
}

function getPageComponent(pathname: string): PageSpec | null {
  const [, ...splittedPathnames] = pathname.split('/')
  if (splittedPathnames[0] === 'account' && splittedPathnames[1] === 'delete') {
    return {
      Component: AccountDeletePage,
    }
  }

  if (splittedPathnames.length >= 1) {
    switch (splittedPathnames[0]) {
      case 'cooperate':
        return {
          Component: CooperatePage,
          getInitialProps: CooperatePage.getInitialProps,
        }
      case 'settings':
        return {
          Component: SettingsPage,
          getInitialProps: SettingsPage.getInitialProps,
        }
      case 'shared':
        return {
          Component: SharedPage,
          getInitialProps: SharedPage.getInitialProps,
        }
    }
  }

  if (splittedPathnames.length >= 2) {
    switch (splittedPathnames[1]) {
      case 'requests': {
        return {
          Component: DenyRequestsPage,
          getInitialProps: DenyRequestsPage.getInitialProps,
        }
      }
      case 'shared':
        return {
          Component: SharedDocsListPage,
          getInitialProps: SharedDocsListPage.getInitialProps,
        }
      case 'delete':
        return {
          Component: DeleteTeamPage,
          getInitialProps: DeleteTeamPage.getInitialProps,
        }
      case 'invite':
        return {
          Component: OpenInvitePage,
          getInitialProps: OpenInvitePage.getInitialProps,
        }
      case 'labels':
        return {
          Component: TagsShowPage,
          getInitialProps: TagsShowPage.getInitialProps,
        }
      case 'workspaces':
        return {
          Component: WorkspaceShowPage,
          getInitialProps: WorkspaceShowPage.getInitialProps,
        }
      case 'smart-folders':
        return {
          Component: SmartFolderPage,
          getInitialProps: SmartFolderPage.getInitialProps,
        }
      default:
        return {
          Component: ResourceIndex,
          getInitialProps: ResourceIndex.getInitialProps,
        }
    }
  }

  if (splittedPathnames.length >= 1) {
    return {
      Component: TeamIndex,
      getInitialProps: TeamIndex.getInitialProps,
    }
  }

  return null
}

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from '../../cloud/lib/router'
import { ThemeProvider } from 'styled-components'
import { useGlobalData } from '../../cloud/lib/stores/globalData'
import { getGlobalData } from '../../cloud/api/global'
import { useEffectOnce } from 'react-use'
import nProgress from 'nprogress'

import { combineProviders } from '../../cloud/lib/utils/context'
import { SettingsProvider, useSettings } from '../../cloud/lib/stores/settings'

import { PreferencesProvider } from '../lib/preferences'
import { SearchProvider } from '../../cloud/lib/stores/search'
import { ExternalEntitiesProvider } from '../../cloud/lib/stores/externalEntities'
import { PageDataProvider } from '../../cloud/lib/stores/pageStore'

import { Mixpanel } from 'mixpanel-browser'
import * as intercom from '../../cloud/lib/intercom'
import { intercomAppId } from '../../cloud/lib/consts'

import CodeMirrorStyle from '../../cloud/components/CodeMirrorStyle'
import { GetInitialPropsParameters } from '../../cloud/interfaces/pages'
import ErrorPage from '../../cloud/components/error/ErrorPage'
import { NavProvider } from '../../cloud/lib/stores/nav'
import { useRealtimeConn } from '../../cloud/lib/stores/realtimeConn'
import { selectV2Theme } from '../../design/lib/styled/styleFunctions'
import { V2ToastProvider } from '../../design/lib/stores/toast'
import { V2EmojiProvider } from '../../design/lib/stores/emoji'
import { V2WindowProvider } from '../../design/lib/stores/window'
import { V2ContextMenuProvider } from '../../design/lib/stores/contextMenu'
import { V2ModalProvider } from '../../design/lib/stores/modal'
import { V2DialogProvider } from '../../design/lib/stores/dialog'
import Toast from '../../design/components/organisms/Toast'
import Dialog from '../../design/components/organisms/Dialog/Dialog'
import MobileContextMenu from './molecules/MobileContextMenu'
import { CommentsProvider } from '../../cloud/lib/stores/comments'
import EmojiPicker from '../../design/components/molecules/EmojiPicker'
import CooperatePage from './pages/CooperatePage'
import RootPage from './pages/RootPage'
import CreateTeamPage from './pages/CreateTeamPage'
import ResourceIndex from './pages/ResourcesPage'
import TeamIndex from './pages/TeamIndex'
import { SidebarCollapseProvider } from '../../cloud/lib/stores/sidebarCollapse'
import DocStatusShowPage from './pages/DocStatusShowPage'
import TagsShowPage from './pages/TagsShowPage'
import OpenInvitePage from './pages/OpenInvitePage'
import SharedDocsListPage from './pages/SharedDocsListPage'
import DeleteTeamPage from './pages/TeamDeletePage'
import DeleteAccountPage from './pages/DeleteAccountPage'
import Modal from './organisms/modals/Modal'
import { AppStatusProvider } from '../lib/appStatus'
import WorkspacePage from './pages/WorkspacePage'
import SettingsPage from './pages/SettingsPage'
import MobileGlobalStyle from './MobileGlobalStyle'
import styled from '../../design/lib/styled'
import Spinner from '../../design/components/atoms/Spinner'
import GlobalStyle from '../../design/components/atoms/GlobalStyle'
import { BaseTheme } from '../../design/lib/styled/types'
import { darkTheme } from '../../design/lib/styled/dark'

const CombinedProvider = combineProviders(
  SidebarCollapseProvider,
  PreferencesProvider,
  SettingsProvider,
  SearchProvider,
  ExternalEntitiesProvider,
  CommentsProvider
)

const V2CombinedProvider = combineProviders(
  V2ToastProvider,
  V2EmojiProvider,
  V2WindowProvider,
  V2ContextMenuProvider,
  V2ModalProvider,
  V2DialogProvider,
  CommentsProvider,
  AppStatusProvider
)

interface PageInfo {
  Component: React.ComponentType<any>
  pageProps: any
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

    Promise.all([
      initialized ? null : getGlobalData(),
      pageSpec.getInitialProps != null
        ? pageSpec.getInitialProps({
            pathname,
            search,
            signal: abortController.signal,
          })
        : {},
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
            Component: ErrorPage,
            pageProps: {
              error,
            },
          })
          nProgress.done()
        }
      })

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
          <GlobalStyle />
        </V2ThemeProvider>
      </SettingsProvider>
    )
  }
  if (pageInfo == null) {
    return (
      <SettingsProvider>
        <V2ThemeProvider theme={darkTheme}>
          <LoadingScreen message='Fetching page data...' />
          <GlobalStyle />
        </V2ThemeProvider>
      </SettingsProvider>
    )
  }

  return (
    <PageDataProvider
      pageProps={pageInfo.pageProps as any}
      navigatingBetweenPage={false}
    >
      <V2CombinedProvider>
        <CombinedProvider>
          <NavProvider>
            <V2ThemeProvider>
              {<pageInfo.Component {...pageInfo.pageProps} />}

              <GlobalStyle />
              <MobileGlobalStyle />
              <CodeMirrorStyle />
              <Toast />
              <MobileContextMenu />
              <EmojiPicker />
              <Dialog />

              <Modal />
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

function getPageComponent(pathname: string): PageSpec | null {
  if (pathname === '' || pathname === '/') {
    return {
      Component: RootPage,
    }
  }
  const [, ...splittedPathnames] = pathname.split('/')
  if (splittedPathnames.length >= 1 && splittedPathnames[0] === 'cooperate') {
    switch (splittedPathnames[1]) {
      case 'team':
        return {
          Component: CreateTeamPage,
        }
      default:
        return {
          Component: CooperatePage,
        }
    }
  }
  if (splittedPathnames[0] === 'settings') {
    return {
      Component: SettingsPage,
      getInitialProps: SettingsPage.getInitialProps,
    }
  }

  if (
    splittedPathnames.length >= 1 &&
    splittedPathnames[0] === 'account' &&
    splittedPathnames[1] === 'delete'
  ) {
    return {
      Component: DeleteAccountPage,
    }
  }

  if (splittedPathnames.length >= 2) {
    switch (splittedPathnames[1]) {
      case 'shared':
        return {
          Component: SharedDocsListPage,
          getInitialProps: SharedDocsListPage.getInitialProps,
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
      case 'status':
        return {
          Component: DocStatusShowPage,
          getInitialProps: DocStatusShowPage.getInitialProps,
        }
      case 'workspaces':
        return {
          Component: WorkspacePage,
          getInitialProps: WorkspacePage.getInitialProps,
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

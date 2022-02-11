import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from '../lib/router'
import { ThemeProvider } from 'styled-components'
import { GlobalDataProvider, useGlobalData } from '../lib/stores/globalData'
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
import EmojiPicker from '../../design/components/molecules/EmojiPicker'
import { NotificationsProvider } from '../../design/lib/stores/notifications'
import { TeamIntegrationsProvider } from '../../design/lib/stores/integrations'
import { TeamStorageProvider } from '../lib/stores/teamStorage'
import DenyRequestsPage from '../pages/[teamId]/requests/deny'
import { darkTheme } from '../../design/lib/styled/dark'
import { TeamPreferencesProvider } from '../lib/stores/teamPreferences'
import Application from './Application'
import { BaseTheme } from '../../design/lib/styled/types'
import { PreviewStyleProvider } from '../../lib/preview'
import HomePage from '../pages/home'
import DashboardPage from '../pages/[teamId]/dashboard'
import ApplicationWithoutPageInfo from './ApplicationWithoutInfoLoader'
import { PagePropsUpdateEventEmitter } from '../lib/utils/events'
import WorkflowListPage from '../pages/workflows'
import AutomationListPage from '../pages/automations'
import WorkflowPage from '../pages/workflows/[workflowId]'
import WorkflowCreatePage from '../pages/workflows/create'
import AutomationCreatePage from '../pages/automations/create'
import AutomationPage from '../pages/automations/[automationId]'
import { BetaRegistrationProvider } from '../lib/stores/beta'
import GithubSourceCallbackPage from './sources/GithubSourceCallbackPage'
import Spinner from '../../design/components/atoms/Spinner'

const CombinedProvider = combineProviders(
  PreviewStyleProvider,
  TeamStorageProvider,
  SidebarCollapseProvider,
  OnboardingProvider,
  PreferencesProvider,
  SettingsProvider,
  SearchProvider,
  ExternalEntitiesProvider,
  CommentsProvider,
  TeamPreferencesProvider,
  BetaRegistrationProvider
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
  TeamIntegrationsProvider
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
  const previousSecondaryPathnameRef = useRef<string | null>(null)
  const [navigatingBetweenPage, setNavigatingBetweenPage] = useState(true)
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
    if (initialized || previousSecondaryPathnameRef.current === pathname) {
      return
    }

    previousSecondaryPathnameRef.current = pathname
    getGlobalData()
      .then((globalData) => {
        initGlobalData(globalData)
      })
      .catch((error) => {
        console.warn(error)
        initGlobalData({
          teams: [],
          invites: [],
        })
      })

    return
  }, [initGlobalData, initialized, pathname])

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return
    }
    setNavigatingBetweenPage(true)
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

    new Promise((resolve, _reject) =>
      resolve(
        pageSpec.getInitialProps != null
          ? pageSpec.getInitialProps({
              pathname,
              search,
              signal: abortController.signal,
            })
          : {}
      )
    )
      .then((pageData) => {
        setPageInfo({
          Component: pageSpec.Component,
          pageProps: pageData,
        })
        PagePropsUpdateEventEmitter.dispatch({ pageProps: pageData })
        nProgress.done()
        setNavigatingBetweenPage(false)
      })
      .catch((error: Error) => {
        if (error.name === 'AbortError') {
          console.warn('Navigation aborted')
          console.warn(error)
        } else {
          console.error(error)
          setPageInfo({
            isError: true,
            Component: ErrorPage,
            pageProps: {
              error,
            },
          })
          nProgress.done()
          setNavigatingBetweenPage(false)
        }
      })

    intercom.update()
    return () => {
      abortController.abort()
    }
  }, [pathname, search])

  if (!initialized) {
    return (
      <PreferencesProvider>
        <GlobalDataProvider>
          <SettingsProvider>
            <V2ThemeProvider>
              <Spinner />
            </V2ThemeProvider>
          </SettingsProvider>
        </GlobalDataProvider>
      </PreferencesProvider>
    )
  }

  if (pageInfo == null) {
    if (isApplicationPagePathname(pathname)) {
      return (
        <PreferencesProvider>
          <GlobalDataProvider>
            <SettingsProvider>
              <V2ThemeProvider>
                <ApplicationWithoutPageInfo />
              </V2ThemeProvider>
            </SettingsProvider>
          </GlobalDataProvider>
        </PreferencesProvider>
      )
    } else {
      return null
    }
  }

  return (
    <PageDataProvider
      pageProps={pageInfo.pageProps as any}
      navigatingBetweenPage={navigatingBetweenPage}
    >
      <V2CombinedProvider>
        <CombinedProvider>
          <NavProvider>
            <V2ThemeProvider>
              {!isApplicationPagePathname(pathname) || pageInfo.isError ? (
                <>
                  <pageInfo.Component {...pageInfo.pageProps} />
                </>
              ) : (
                <Application>
                  <pageInfo.Component {...pageInfo.pageProps} />
                </Application>
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
    (splittedPathnames.length >= 2 && splittedPathnames[1] === 'invite') ||
    (splittedPathnames.length >= 1 &&
      [
        'account',
        'cooperate',
        'settings',
        'shared',
        'invite',
        'sources',
      ].includes(splittedPathnames[0]))
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
      case 'sources':
        if (
          splittedPathnames[1] === 'github' &&
          splittedPathnames[2] === 'callback'
        ) {
          return {
            Component: GithubSourceCallbackPage,
          }
        }
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
      case 'desktop':
        return {
          Component: HomePage,
          getInitialProps: HomePage.getInitialProps,
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
      case 'dashboards': {
        return {
          Component: DashboardPage,
          getInitialProps: DashboardPage.getInitialProps,
        }
      }
      case 'workspaces':
        return {
          Component: WorkspaceShowPage,
          getInitialProps: WorkspaceShowPage.getInitialProps,
        }
      case 'workflows':
        if (splittedPathnames[2] == null) {
          return {
            Component: WorkflowListPage,
            getInitialProps: WorkflowListPage.getInitialProps,
          }
        }

        if (splittedPathnames[2] === 'create') {
          return {
            Component: WorkflowCreatePage,
            getInitialProps: WorkflowCreatePage.getInitialProps,
          }
        }

        return {
          Component: WorkflowPage,
          getInitialProps: WorkflowPage.getInitialProps,
        }
      case 'automations':
        if (splittedPathnames[2] == null) {
          return {
            Component: AutomationListPage,
            getInitialProps: AutomationListPage.getInitialProps,
          }
        }

        if (splittedPathnames[2] === 'create') {
          return {
            Component: AutomationCreatePage,
            getInitialProps: AutomationCreatePage.getInitialProps,
          }
        }

        return {
          Component: AutomationPage,
          getInitialProps: AutomationPage.getInitialProps,
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

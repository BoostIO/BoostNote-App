import React, { useState, useEffect } from 'react'
import { useRouter } from '../lib/router'
import styled from '../lib/styled'
import ButtonLink from './atoms/ButtonLink'
import { ThemeProvider } from 'styled-components'
import { useGlobalData } from '../lib/stores/globalData'
import { getGlobalData } from '../api/global'
import { useEffectOnce } from 'react-use'
import nProgress from 'nprogress'
import AccountDeletePage from '../pages/account/delete'

const NotFoundPageContainer = styled.div`
  padding: 15px 25px;
`

import { SidebarCollapseProvider } from '../lib/stores/sidebarCollapse'
import { combineProviders } from '../lib/utils/context'
import { ElectronProvider } from '../lib/stores/electron'
import { EmojiPickerProvider } from '../lib/stores/emoji'
import { OnboardingProvider } from '../lib/stores/onboarding'
import { ContextMenuProvider } from '../lib/stores/contextMenu'
import { SettingsProvider, useSettings } from '../lib/stores/settings'

import { ModalProvider } from '../lib/stores/modal'
import { PreferencesProvider } from '../lib/stores/preferences'
import { DialogProvider } from '../lib/stores/dialog'
import { SearchProvider } from '../lib/stores/search'
import { WindowProvider } from '../lib/stores/window'
import { ExternalEntitiesProvider } from '../lib/stores/externalEntities'
import { lightTheme, darkTheme } from '../lib/styled/themes'
import { PageDataProvider } from '../lib/stores/pageStore'

const CombinedProvider = combineProviders(
  ElectronProvider,
  SidebarCollapseProvider,
  EmojiPickerProvider,
  OnboardingProvider,
  ContextMenuProvider,
  ModalProvider,
  PreferencesProvider,
  SettingsProvider,
  DialogProvider,
  SearchProvider,
  ExternalEntitiesProvider,
  WindowProvider
)
interface PageInfo {
  Component: React.ComponentType<any>
  pageProps: any
}

interface PageSpec {
  Component: React.ComponentType<any>
  getInitialProps?: (
    pathname: string,
    search: string,
    abortController: AbortController
  ) => Promise<any>
}

const Router = () => {
  const { pathname, search } = useRouter()
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)

  const { initGlobalData, initialized } = useGlobalData()
  useEffectOnce(() => {
    ;(async () => {
      const data = await getGlobalData()

      initGlobalData(data)
    })()
  })

  useEffect(() => {
    console.info('navigate to ', pathname, search)
    nProgress.start()
    const pageSpec = getPageComponent(pathname)
    if (pageSpec == null) {
      setPageInfo(null)
      nProgress.done()
      return
    }

    const abortController = new AbortController()
    if (pageSpec.getInitialProps != null) {
      pageSpec
        .getInitialProps(pathname, search, abortController)
        .then((data) => {
          setPageInfo({
            Component: pageSpec.Component,
            pageProps: data,
          })
          nProgress.done()
        })
        .catch((error: Error) => {
          if (error.name) {
            console.warn('Navigation aborted')
            console.warn(error)
          } else {
            console.error(error)
          }
          // Show error page
        })
    } else {
      setPageInfo({
        Component: pageSpec.Component,
        pageProps: {},
      })
      nProgress.done()
    }

    return () => {
      abortController.abort()
    }
    // Determine which page to show and how to fetch it

    // How to fetch does exist in get initial props so we need to determine the component
  }, [pathname, search])

  if (!initialized) {
    return <div>Fetching global data...</div>
  }

  if (pageInfo == null) {
    return (
      <ThemeProvider theme={darkTheme}>
        <NotFoundPageContainer>
          <ButtonLink href='/account/delete'>Go</ButtonLink>
          <h1>Page not found</h1>
          <p>Check the URL or click other link in the left side navigation.</p>
        </NotFoundPageContainer>
      </ThemeProvider>
    )
  }
  const [, ...pathnameElements] = pathname.split('/')

  if (pathnameElements[0] === 'account') {
    if (pathnameElements[1] === 'delete') {
      return (
        <PageDataProvider pageProps={pageInfo.pageProps as any}>
          <CombinedProvider>
            <CustomThemeProvider>
              {<pageInfo.Component {...pageInfo.pageProps} />}
            </CustomThemeProvider>
          </CombinedProvider>
        </PageDataProvider>
      )
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <NotFoundPageContainer>
        <ButtonLink href='/account/delete'>Go</ButtonLink>
        <h1>Page not found</h1>
        <p>Check the URL or click other link in the left side navigation.</p>
      </NotFoundPageContainer>
    </ThemeProvider>
  )
}

export default Router

const CustomThemeProvider: React.FC = ({ children }) => {
  const { settings } = useSettings()
  const { pathname } = useRouter()
  return (
    <ThemeProvider
      theme={
        isHomepagePathname(pathname)
          ? darkTheme
          : selectTheme(settings['general.theme'])
      }
    >
      {children}
    </ThemeProvider>
  )
}

function selectTheme(theme: string) {
  switch (theme) {
    case 'dark':
      return darkTheme
    case 'light':
    default:
      return lightTheme
  }
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
  const [, ...splittedPathnames] = pathname.split('/')
  if (splittedPathnames[0] === 'account' && splittedPathnames[1]) {
    return {
      Component: AccountDeletePage,
    }
  }

  return null
}

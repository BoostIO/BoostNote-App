import { openNew } from './platform'
import { format as formatUrl } from 'url'
import { join } from 'path'
import { getPathByName } from './electronOnly'
import { WebviewTag } from 'electron'
import React, { useRef, useCallback, FC } from 'react'
import { createStoreContext } from './context'
import querystring from 'querystring'

export const boostHubBaseUrl = process.env.BOOST_HUB_BASE_URL as string

export const boostHubWebViewUserAgent = `${navigator.userAgent} BoostNote ${process.env.VERSION}`

const boostHubDesktopLoginPageUrl = `${boostHubBaseUrl}/desktop/login`

export const boostHubLearnMorePageUrl = `${boostHubBaseUrl}/features`

export function openLoginPage(state: string) {
  const loginPageUrl = `${boostHubDesktopLoginPageUrl}?state=${state}`

  openNew(loginPageUrl)
}

export function getBoostHubTeamPageUrl(teamName: string) {
  return `${boostHubBaseUrl}/${teamName}`
}

export const boostHubTeamsCreatePageUrl = `${boostHubBaseUrl}/cooperate`

export const boostHubIdlePageUrl = `${boostHubBaseUrl}/api/desktop/idle`

export const boostHubPreloadUrl = formatUrl({
  pathname:
    process.env.NODE_ENV === 'production'
      ? join(getPathByName('app'), './compiled/static/boosthub-preload.js')
      : join(getPathByName('app'), '../static/boosthub-preload.js'),
  protocol: 'file',
  slashes: true,
})

const boostHubDesktopLoginApiUrl = `${boostHubBaseUrl}/api/desktop/login`
const boostHubDesktopGlobalDataUrl = `${boostHubBaseUrl}/api/desktop`
const boostHubSignOutUrl = `${boostHubBaseUrl}/api/desktop/signout`

function useBoostHubStore() {
  const webviewRef = useRef<WebviewTag>(null)

  const fetchJson = useCallback(
    async (
      url: string,
      options?: {
        method: string
      }
    ) => {
      const { method } = {
        method: 'get',
        ...options,
      }
      return webviewRef.current!.executeJavaScript(
        `fetch("${url}", {method: "${method}"}).then(response => response.json())`
      )
    },
    []
  )

  const fetchDesktopGlobalData = useCallback(async () => {
    const data = await fetchJson(boostHubDesktopGlobalDataUrl)

    return data as {
      user: {
        id: string
        uniqueName: string
        displayName: string
      }
      teams: { id: string; domain: string; name: string }[]
    }
  }, [fetchJson])

  const sendSignInRequest = async (state: string, code: string) => {
    const data = await fetchJson(
      `${boostHubDesktopLoginApiUrl}?${querystring.encode({ state, code })}`,
      { method: 'post' }
    )

    return data as {
      user: {
        id: string
        uniqueName: string
        displayName: string
      }
      teams: { id: string; domain: string; name: string }[]
    }
  }
  const signOut = useCallback(async () => {
    await fetchJson(boostHubSignOutUrl)
  }, [fetchJson])

  const openDevTools = useCallback(() => {
    webviewRef.current!.openDevTools()
  }, [])

  return {
    webviewRef,
    fetchDesktopGlobalData,
    sendSignInRequest,
    signOut,
    openDevTools,
  }
}

export const { StoreProvider, useStore: useBoostHub } = createStoreContext(
  useBoostHubStore
)

export const BoostHubStoreProvider: FC = ({ children }) => {
  return (
    <StoreProvider>
      <BoostHubIdleWebview />
      {children}
    </StoreProvider>
  )
}

const BoostHubIdleWebview = () => {
  const { webviewRef } = useBoostHub()

  return (
    <webview
      src={boostHubIdlePageUrl}
      ref={webviewRef}
      style={{ position: 'fixed', top: -1, left: -1, width: 1, height: 1 }}
      preload={boostHubPreloadUrl}
    />
  )
}

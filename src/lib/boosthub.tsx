import { openNew } from './platform'
import { format as formatUrl } from 'url'
import { join } from 'path'
import { getPathByName } from './electronOnly'
import { WebviewTag } from 'electron'
import React, { useRef, useCallback, FC } from 'react'
import { createStoreContext } from './context'
import querystring from 'querystring'
import { useEffectOnce } from 'react-use'

export const boostHubBaseUrl = process.env.BOOST_HUB_BASE_URL as string

export const boostHubWebViewUserAgent = `${navigator.userAgent} BoostNote ${process.env.VERSION}`

const boostHubDesktopLoginPageUrl = `${boostHubBaseUrl}/desktop/login`

export const boostHubAccountDeletePageUrl = `${boostHubBaseUrl}/account/delete`

export const boostHubLearnMorePageUrl = `${boostHubBaseUrl}/features`

export function openLoginPage(state: string) {
  const loginPageUrl = `${boostHubDesktopLoginPageUrl}?state=${state}`

  openNew(loginPageUrl)
}

export function getBoostHubTeamPageUrl(teamName: string) {
  return `${boostHubBaseUrl}/${teamName}`
}

export function getBoostHubTeamIconUrl(location: string) {
  return `${boostHubBaseUrl}/api/files/icons/${location}`
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
let domReady = false
const domReadyQueue = [] as { resolve?: () => void; reject?: () => void }[]

function waitDomReady() {
  const queue: { resolve?: () => void; reject?: () => void } = {}
  const promise = new Promise((resolve, reject) => {
    if (domReady) {
      console.log('dom ready no wait')
      resolve()
      return
    }
    queue.resolve = resolve
    queue.reject = reject
    domReadyQueue.push(queue)
  })

  return promise
}

function useBoostHubStore() {
  const webviewRef = useRef<WebviewTag>(null)

  useEffectOnce(() => {
    webviewRef.current!.addEventListener('dom-ready', () => {
      domReady = true
      let queue = domReadyQueue.shift()
      while (queue != null) {
        if (queue.resolve != null) {
          queue.resolve()
        }
        queue = domReadyQueue.shift()
      }
    })
  })

  const fetchJson = useCallback(
    async (
      url: string,
      options?: {
        method: string
      }
    ) => {
      await waitDomReady()
      const { method } = {
        method: 'get',
        ...options,
      }
      const rawText = await webviewRef.current!.executeJavaScript(
        `fetch("${url}", {method: "${method}"}).then(response => response.text())`
      )
      try {
        return JSON.parse(rawText)
      } catch (error) {
        console.warn('Invalid json body', error)
        throw new Error(rawText)
      }
    },
    []
  )

  const fetchDesktopGlobalData = useCallback(async () => {
    const data = await fetchJson(boostHubDesktopGlobalDataUrl)

    return {
      user: {
        id: data.user.id,
        uniqueName: data.user.uniqueName,
        displayName: data.user.displayName,
      },
      teams: data.teams.map((team: any) => {
        return {
          id: team.id,
          name: team.name,
          domain: team.domain,
          iconUrl:
            team.icon != null
              ? getBoostHubTeamIconUrl(team.icon.location)
              : undefined,
        }
      }),
    } as {
      user: {
        id: string
        uniqueName: string
        displayName: string
      }
      teams: { id: string; name: string; domain: string; iconUrl?: string }[]
    }
  }, [fetchJson])

  const sendSignInRequest = async (state: string, code: string) => {
    const data = await fetchJson(
      `${boostHubDesktopLoginApiUrl}?${querystring.encode({ state, code })}`,
      { method: 'post' }
    )

    return {
      user: {
        id: data.user.id,
        uniqueName: data.user.uniqueName,
        displayName: data.user.displayName,
      },
      teams: data.teams.map((team: any) => {
        return {
          id: team.id,
          name: team.name,
          domain: team.domain,
          iconUrl:
            team.icon != null
              ? getBoostHubTeamIconUrl(team.icon.location)
              : undefined,
        }
      }),
    } as {
      user: {
        id: string
        uniqueName: string
        displayName: string
      }
      teams: { id: string; name: string; domain: string; iconUrl?: string }[]
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

import { openNew } from './platform'
import { format as formatUrl } from 'url'
import { join } from 'path'
import { getPathByName } from './electronOnly'
import React, { FC } from 'react'
import { createStoreContext } from './context'
import ky from 'ky'

export const boostHubBaseUrl = process.env.BOOST_HUB_BASE_URL as string

export const boostHubWebViewUserAgent = `${navigator.userAgent} BoostNote ${process.env.VERSION}`

const boostHubDesktopLoginPageUrl = `${boostHubBaseUrl}/desktop/login`

export const boostHubAccountDeletePageUrl = `${boostHubBaseUrl}/account/delete`

export const boostHubLearnMorePageUrl = `${boostHubBaseUrl}/for-teams/features`

const boostHubCreateDesktopAccessTokenUrl = `${boostHubBaseUrl}/api/desktop/access-tokens`

export function openLoginPage(state: string) {
  const loginPageUrl = `${boostHubDesktopLoginPageUrl}?state=${state}`

  openNew(loginPageUrl)
}

export function getBoostHubTeamPageUrl(teamName: string) {
  if (process.env.NODE_ENV !== 'production') {
    return `http://localhost:3003/#/${teamName}`
  }
  return join(getPathByName('app'), `./compiled/cloud/index.html#/${teamName}`)
}

export function getBoostHubTeamIconUrl(location: string) {
  return `${boostHubBaseUrl}/api/files/icons/${location}`
}

export const boostHubTeamsCreatePageUrl = `${boostHubBaseUrl}/cooperate`

export const boostHubIdlePageUrl = `${boostHubBaseUrl}/api/desktop/idle`

export const boostHubPreloadUrl = formatUrl({
  pathname:
    process.env.NODE_ENV === 'production'
      ? join(getPathByName('app'), './compiled/app/static/boosthub-preload.js')
      : join(getPathByName('app'), '../static/boosthub-preload.js'),
  protocol: 'file',
  slashes: true,
})

const boostHubDesktopGlobalDataUrl = `${boostHubBaseUrl}/api/desktop`

export async function fetchDesktopGlobalData(token: string) {
  const data = await ky
    .get(boostHubDesktopGlobalDataUrl, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .json()
  return data as {
    user?: {
      id: string
      uniqueName: string
      displayName: string
    }
    teams: { id: string; name: string; domain: string; iconUrl?: string }[]
  }
}

export async function createDesktopAccessToken(
  state: string,
  code: string
): Promise<{ token: string }> {
  const data = await ky
    .post(boostHubCreateDesktopAccessTokenUrl, {
      method: 'post',
      json: {
        state,
        code,
        deviceName: navigator.userAgent,
      },
    })
    .json()
  return data as { token: string }
}

function useBoostHubStore() {
  return {
    fetchDesktopGlobalData,
  }
}

export const { StoreProvider, useStore: useBoostHub } = createStoreContext(
  useBoostHubStore
)

export const BoostHubStoreProvider: FC = ({ children }) => {
  return <StoreProvider>{children}</StoreProvider>
}

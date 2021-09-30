import { openNew } from './platform'
import { format as formatUrl } from 'url'
import { join } from 'path'
import { getPathByName, removeCookie } from './electronOnly'
import { useCallback } from 'react'
import { createStoreContext } from './context'
import ky from 'ky'
import { useRouteParams } from './routeParams'
import { useGeneralStatus } from './generalStatus'
import { usePreferences } from './preferences'
import { useRouter } from './router'
import { SerializedSubscription } from '../cloud/interfaces/db/subscription'
import { SerializedUserTeamPermissions } from '../cloud/interfaces/db/userTeamPermissions'

export const boostHubBaseUrl = process.env.BOOST_HUB_BASE_URL as string

export const boostHubWebViewUserAgent = `${navigator.userAgent} ${process.env.VERSION} Cloud Space`

const boostHubDesktopLoginPageUrl = `${boostHubBaseUrl}/desktop/login`

export const boostHubAccountDeletePageUrl = `${boostHubBaseUrl}/account/delete`

export const boostHubLearnMorePageUrl = `${boostHubBaseUrl}/features`
export const boostHubPricingPageUrl = `${boostHubBaseUrl}/pricing`

const boostHubCreateDesktopAccessTokenUrl = `${boostHubBaseUrl}/api/desktop/access-tokens`

export function openLoginPage(state: string) {
  const loginPageUrl = `${boostHubDesktopLoginPageUrl}?state=${state}`

  openNew(loginPageUrl)
}

export function getBoostHubHomepageUrl() {
  return `${process.env.BOOST_HUB_BASE_URL}/desktop`
}

export function getBoostHubTeamPageUrl(teamName: string) {
  return `${process.env.BOOST_HUB_BASE_URL}/${teamName}`
  // if (process.env.NODE_ENV !== 'production') {
  //   return `http://localhost:3004/#/${teamName}`
  // }
  // return join(getPathByName('app'), `./compiled-cloud/index.html#/${teamName}`)
}

export function getBoostHubTeamIconUrl(location: string) {
  return `${boostHubBaseUrl}/api/files/icons/${location}`
}

export const boostHubTeamsCreatePageUrl = `${process.env.BOOST_HUB_BASE_URL}/cooperate`
// process.env.NODE_ENV !== 'production'
//   ? `http://localhost:3004/#/cooperate`
//   : join(getPathByName('app'), `./compiled-cloud/index.html#/cooperate`)

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

export type DesktopGlobalDataResponseBody = {
  user?: {
    id: string
    uniqueName: string
    displayName: string
  }
  teams: {
    id: string
    name: string
    domain: string
    icon?: { location: string }
    createdAt: string
    subscription?: SerializedSubscription
    permissions: SerializedUserTeamPermissions[]
    trial?: boolean
  }[]
}

export async function fetchDesktopGlobalData(token: string) {
  const data = await ky
    .get(boostHubDesktopGlobalDataUrl, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .json()
  return data as DesktopGlobalDataResponseBody
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
  const { push } = useRouter()
  const { setPreferences } = usePreferences()
  const { setGeneralStatus } = useGeneralStatus()
  const routeParams = useRouteParams()

  const signOut = useCallback(async () => {
    if (
      routeParams.name === 'boosthub.teams.show' ||
      routeParams.name === 'boosthub.teams.create'
    ) {
      push('/app/boosthub/login')
    }
    setPreferences({
      'cloud.user': null,
    })
    setGeneralStatus({
      boostHubTeams: [],
    })

    removeCookie(boostHubBaseUrl, 'desktop_access_token')
  }, [routeParams.name, setPreferences, setGeneralStatus, push])

  return {
    fetchDesktopGlobalData,
    signOut,
  }
}

export const {
  StoreProvider: BoostHubStoreProvider,
  useStore: useBoostHub,
} = createStoreContext(useBoostHubStore)

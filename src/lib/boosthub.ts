import ky from 'ky'
import { openNew } from './platform'

export const boostHubBaseUrl = process.env.BOOST_HUB_BASE_URL as string

export const boostHubWebViewUserAgent = `${navigator.userAgent} BoostNote ${process.env.VERSION}`

const boostHubDesktopLoginPageUrl = `${boostHubBaseUrl}/desktop/login`

export function openLoginPage(state: string) {
  const loginPageUrl = `${boostHubDesktopLoginPageUrl}?state=${state}`

  openNew(loginPageUrl)
}

const boostHubDesktopLoginApiUrl = `${boostHubBaseUrl}/api/desktop/login`

export async function sendLoginRequest(state: string, code: string) {
  const response = await ky.post(boostHubDesktopLoginApiUrl, {
    json: true,
    searchParams: {
      state,
      code,
    },
  })

  const data = await response.json()

  return data as {
    user: {
      id: string
      uniqueName: string
      displayName: string
    }
    teams: { id: string; domain: string; name: string }[]
  }
}

const boostHubCurrentUserApiUrl = `${boostHubBaseUrl}/api/users`

export async function fetchCurrentUser() {
  const response = await ky.get(boostHubCurrentUserApiUrl)

  const data = await response.json()

  return data.user
}

const boostHubTeamApiUrl = `${boostHubBaseUrl}/api/teams`

export async function fetchTeams() {
  const response = await ky.get(boostHubTeamApiUrl)

  const data = await response.json()

  return data.teams
}

const boostHubDesktopGlobalDataUrl = `${boostHubBaseUrl}/api/desktop`

export async function fetchDesktopGlobalData() {
  const response = await ky.get(boostHubDesktopGlobalDataUrl)

  const data = await response.json()

  return data as {
    user: {
      id: string
      uniqueName: string
      displayName: string
    }
    teams: { id: string; domain: string; name: string }[]
  }
}

export function getBoostHubTeamPageUrl(teamName: string) {
  return `${boostHubBaseUrl}/${teamName}`
}

export const boostHubTeamsCreatePageUrl = `${boostHubBaseUrl}/cooperate`

const boostHubLogOutUrl = `${boostHubBaseUrl}/api/oauth/signout`

export async function logOut() {
  await ky.get(boostHubLogOutUrl)
}

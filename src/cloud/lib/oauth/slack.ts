import { OAuthHandler } from '.'
import axios from 'axios'
import { stringify } from 'querystring'

const AUTH_URL = 'https://slack.com/oauth/authorize'
const TOKEN_URL = 'https://slack.com/api/oauth.access'
const USER_ENDPOINT = 'https://slack.com/api/users.info'
const SCOPES = [
  'channels:read',
  'channels:write',
  'chat:write:user',
  'dnd:read',
  'dnd:write',
  'files:read',
  'files:write:user',
  'pins:read',
  'pins:write',
  'reactions:read',
  'reactions:write',
  'reminders:read',
  'reminders:write',
  'team:read',
  'usergroups:read',
  'usergroups:write',
  'users:read',
  'users:write',
]

export function createSlackOauthHandler(
  clientId: string,
  clientSecret: string
): OAuthHandler {
  return {
    getAuthUrl: buildGetAuthUrl(clientId),
    getToken: buildGetToken(clientId, clientSecret),
  }
}

// TODO scopes
function buildGetAuthUrl(clientId: string) {
  return (state: string, callbackUrl: string) => {
    const params = stringify({
      client_id: clientId,
      redirect_uri: callbackUrl,
      state,
      scope: SCOPES.join(' '),
    })
    return `${AUTH_URL}?${params}`
  }
}

function buildGetToken(clientId: string, clientSecret: string) {
  return async (code: string) => {
    const data = { code }
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    }

    const response = await axios.post(TOKEN_URL, stringify(data), { headers })
    if (response.data.ok !== true) {
      throw new Error(`Error getting token: ${response.data.error}`)
    }
    const { access_token, team_name, user_id } = response.data
    const userInfoResponse = await axios.get(
      `${USER_ENDPOINT}?user=${user_id}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    if (userInfoResponse.data.ok !== true) {
      throw new Error(`Error getting user info: ${response.data.console.error}`)
    }

    const { user } = userInfoResponse.data

    return { token: access_token, userIdentifier: `${user.name}@${team_name}` }
  }
}

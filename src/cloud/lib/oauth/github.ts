import { OAuthHandler } from '.'
import { stringify } from 'querystring'
import axios from 'axios'

const AUTH_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const USER_INFO_URL = 'https://api.github.com/user'
const SCOPES = ['read:user', 'repo', 'read:org']

interface GetTokenResponse {
  access_token: string
  scope: string
  token_type: string
}

interface GetUserResponse {
  login: string
  email: string
}

export function createGithubOauthHandler(
  clientId: string,
  clientSecret: string
): OAuthHandler {
  return {
    getAuthUrl: buildGetAuthUrl(clientId),
    getToken: buildGetToken(clientId, clientSecret),
  }
}

function buildGetAuthUrl(clientId: string) {
  return (state: string, callbackUrl: string) => {
    const params = stringify({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: SCOPES.join(' '),
      state,
    })
    return `${AUTH_URL}?${params}&login`
  }
}

function buildGetToken(clientId: string, clientSecret: string) {
  return async (code: string, state: string) => {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    }
    const headers = {
      Accept: 'application/json',
    }
    const response = await axios.post(TOKEN_URL, data, { headers })
    const { access_token } = response.data as GetTokenResponse
    const user = await axios.get(USER_INFO_URL, {
      headers: { Authorization: `token ${access_token}` },
    })
    const { login } = user.data as GetUserResponse
    return {
      token: access_token,
      userIdentifier: login,
    }
  }
}

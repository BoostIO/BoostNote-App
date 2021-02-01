import { OAuthHandler } from '.'
import { stringify } from 'querystring'
import axios from 'axios'

const AUTH_URL = 'https://vercel.com/oauth/authorize'
const TOKEN_URL = 'https://api.vercel.com/v2/oauth/access_token'
const USER_INFO_URL = 'https://api.vercel.com/www/user'

export function createVercelOauthHandler(
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
      state,
    })
    return `${AUTH_URL}?${params}`
  }
}

function buildGetToken(clientId: string, clientSecret: string) {
  return async (code: string, state: string, callbackUrl: string) => {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
      redirect_uri: callbackUrl,
    }
    const response = await axios.post(TOKEN_URL, stringify(data))
    const { access_token } = response.data

    const userInfoResponse = await axios.get(USER_INFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const { user } = userInfoResponse.data
    return { token: access_token, userIdentifier: user.username }
  }
}

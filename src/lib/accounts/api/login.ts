const baseUrl = process.env.BOOST_NOTE_BASE_URL

const loginStartUrl = `${baseUrl}/api/login/external/requests`
const loginCheckUrl = `${baseUrl}/api/login/external`
const loginFrontUrl = `${baseUrl}/api/login/external`

interface LoginInfo {
  code: string
  id: number
  state: string
}

export interface LoginCompleteResponse {
  token: string
  user: {
    id: number
    name: string
  }
}

export type CheckLoginError = 'NotFound' | 'Expired' | 'Forbidden' | 'Consumed'
export type CheckLoginOk = 'NotReady' | LoginCompleteResponse
export type CheckLoginResponse = CheckLoginError | CheckLoginOk

const headers = [
  ['accept', 'application/json'],
  ['Content-Type', 'application/json'],
]

export const initiateLogin = async (state: string): Promise<LoginInfo> => {
  const response = await fetch(loginStartUrl, {
    method: 'POST',
    body: JSON.stringify({ state }),
    headers,
  })

  if (!response.ok) {
    throw Error('Network Error')
  }

  const info = await response.json()
  return { state, ...info }
}

export const checkLogin = async ({
  code,
  state,
}: LoginInfo): Promise<CheckLoginResponse> => {
  const response = await fetch(loginCheckUrl, {
    method: 'POST',
    body: JSON.stringify({ state, code }),
    headers,
  })

  switch (response.status) {
    case 404:
      return 'NotFound'
    case 422:
      return 'Expired'
    case 403:
      return 'Forbidden'
    case 409:
      return 'Consumed'
    case 200:
      return 'NotReady'
    case 201:
      return response.json()
    default:
      throw Error('Network Error')
  }
}

export const isLoginComplete = (
  check: CheckLoginResponse
): check is LoginCompleteResponse => typeof check !== 'string'

export const getLoginPageUrl = (info: LoginInfo) =>
  `${loginFrontUrl}?state=${info.state}&requestId=${info.id}`

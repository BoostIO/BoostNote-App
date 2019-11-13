
const BASE = process.env.BOOST_NOTE_BASE_URL

const LOGIN_START = `${BASE}/api/login/external/requests`
const LOGIN_CHECK = `${BASE}/api/login/external`
const LOGIN_FRONT = `${BASE}/api/login/external`

export interface LoginInfo {
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

export type CheckResponse = 'not_ready' | LoginCompleteResponse

const headers = [
  ['accept', 'application/json'],
  ['Content-Type', 'application/json']
]

export const initiateLogin = (state: string): Promise<LoginInfo> =>
  fetch(LOGIN_START, {
    method: 'POST',
    body: JSON.stringify({ state }),
    headers
  })
    .then(res => res.json())
    .then(info => ({ state, ...info }))

export const checkLogin = ({
  code,
  state
}: LoginInfo): Promise<CheckResponse> =>
  fetch(LOGIN_CHECK, {
    method: 'POST',
    body: JSON.stringify({ state, code }),
    headers
  }).then(r => (r.status === 200 ? 'not_ready' : r.json()))

export const isLoginComplete = (
  check: CheckResponse
): check is LoginCompleteResponse => typeof check !== 'string'

export const getLoginPage = (info: LoginInfo) =>
  `${LOGIN_FRONT}?state=${info.state}&requestId=${info.id}`

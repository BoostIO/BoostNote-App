import { useState, useEffect } from 'react'
import { retry } from '../utils/sleep'
import { generateSecret } from '../utils/secret'
import {
  LoginInfo,
  checkLogin,
  isLoginComplete,
  initiateLogin,
  getLoginPageUrl,
  LoginCompleteResponse
} from './api'
import { openNew } from '../utils/platform'

type LoginState =
  | { kind: 'idle' }
  | { kind: 'requesting-token' }
  | { kind: 'attempting-login'; state: LoginInfo }
  | { kind: 'login-success'; state: LoginCompleteResponse }
  | { kind: 'error'; message: string }

type CompleteCallback = (data: LoginCompleteResponse) => void

export function useLogin(
  completeCallback?: CompleteCallback
): [LoginState, () => void] {
  const [state, setState] = useState<LoginState>({ kind: 'idle' })

  useEffect(() => {
    if (state.kind === 'requesting-token') {
      initiateLogin(generateSecret())
        .then(info => {
          setState({
            kind: 'attempting-login',
            state: info
          })
          openNew(getLoginPageUrl(info))
        })
        .catch(() => setState({ kind: 'error', message: 'An error occured' }))
    }

    if (state.kind === 'attempting-login') {
      pingLogin(state.state)
        .then(data => {
          setState({ kind: 'login-success', state: data })
          if (completeCallback != null) {
            completeCallback(data)
          }
        })
        .catch(() => setState({ kind: 'error', message: 'An error occured' }))
    }
  }, [state.kind])

  const startLogin = () => {
    if (state.kind === 'idle' || state.kind === 'login-success') {
      setState({ kind: 'requesting-token' })
    }
  }

  return [state, startLogin]
}

const pingLogin = retry(() => 5, isLoginComplete, checkLogin)

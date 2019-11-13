import { useState, useEffect } from 'react'
import { retry } from '../utils/sleep'
import { generateSecret } from '../utils/secret'
import {
  LoginInfo,
  checkLogin,
  isLoginComplete,
  initiateLogin,
  getLoginPage,
  LoginCompleteResponse
} from './api'
import { openNew } from '../utils/platform'

type LoginState =
  | { kind: 'idle' }
  | { kind: 'request-token' }
  | { kind: 'attempt-login'; state: LoginInfo }
  | { kind: 'logged-in'; state: LoginCompleteResponse }
  | { kind: 'error'; message: string }

type CompleteCallback = (data: LoginCompleteResponse) => void

export function useLogin(
  completeCallback?: CompleteCallback
): [LoginState, () => void] {
  const [state, setState] = useState<LoginState>({ kind: 'idle' })

  useEffect(() => {
    if (state.kind === 'request-token') {
      initiateLogin(generateSecret())
        .then(info => {
          setState({
            kind: 'attempt-login',
            state: info
          })
          openNew(getLoginPage(info))
        })
        .catch(() => setState({ kind: 'error', message: 'An error occured' }))
    }

    if (state.kind === 'attempt-login') {
      pingLogin(state.state)
        .then(data => {
          setState({ kind: 'logged-in', state: data })
          if (completeCallback != null) {
            completeCallback(data)
          }
        })
        .catch(() => setState({ kind: 'error', message: 'An error occured' }))
    }
  }, [state.kind])

  const startLogin = () => {
    if (state.kind === 'idle' || state.kind === 'logged-in') {
      setState({ kind: 'request-token' })
    }
  }

  return [state, startLogin]
}

const pingLogin = retry(() => 5, isLoginComplete, checkLogin)

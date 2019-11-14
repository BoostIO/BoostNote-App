import { useState } from 'react'
import { retry } from '../utils/sleep'
import { generateSecret } from '../utils/secret'
import {
  checkLogin,
  isLoginComplete,
  initiateLogin,
  getLoginPageUrl,
  LoginCompleteResponse
} from './api'
import { openNew } from '../utils/platform'

type LoginState =
  | { kind: 'idle' }
  | { kind: 'logging-in' }
  | { kind: 'login-complete' }
  | { kind: 'error'; message: string }

type CompleteCallback = (data: LoginCompleteResponse) => void

type LoginDispatch = React.Dispatch<React.SetStateAction<LoginState>>

export function useLogin(
  completeCallback?: CompleteCallback
): [LoginState, () => void] {
  const [state, setState] = useState<LoginState>({ kind: 'idle' })

  const startLogin = () => {
    if (state.kind !== 'logging-in') {
      loginStart(setState, completeCallback)
    }
  }

  return [state, startLogin]
}

const loginStart = async (
  setState: LoginDispatch,
  callback?: CompleteCallback
) => {
  try {
    setState({ kind: 'logging-in' })

    const info = await initiateLogin(generateSecret())
    openNew(getLoginPageUrl(info))

    const response = await pingLogin(info)

    if (isLoginComplete(response)) {
      setState({ kind: 'login-complete' })
      if (callback != null) {
        callback(response)
      }
    } else {
      setState({ kind: 'error', message: response })
    }
  } catch (error) {
    setState({ kind: 'error', message: 'NetworkError' })
  }
}

const pingLogin = retry(() => 5, check => check !== 'NotReady', checkLogin)

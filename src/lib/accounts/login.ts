import { useState } from 'react'
import { retry } from '../sleep'
import { generateRandomHex } from '../string'
import {
  checkLogin,
  isLoginComplete,
  initiateLogin,
  getLoginPageUrl,
  LoginCompleteResponse,
  CheckLoginError
} from './api/login'
import { openNew } from '../platform'

type LoginState = 'idle' | 'logging-in'

type CompleteCallback = (data: LoginCompleteResponse) => void
type ErrorCallback = (data: CheckLoginError | 'NetworkError') => void

type LoginDispatch = React.Dispatch<React.SetStateAction<LoginState>>

export function useLogin(
  onSuccess: CompleteCallback,
  onErr: ErrorCallback
): [LoginState, () => void] {
  const [state, setState] = useState<LoginState>('idle')

  const startLogin = () => {
    if (state !== 'logging-in') {
      loginStart(setState, onSuccess, onErr)
    }
  }

  return [state, startLogin]
}

const loginStart = async (
  setState: LoginDispatch,
  onSuccess: CompleteCallback,
  onErr: ErrorCallback
) => {
  try {
    setState('logging-in')

    const info = await initiateLogin(generateRandomHex())
    openNew(getLoginPageUrl(info))

    const response = await pingLogin(info)

    if (isLoginComplete(response)) {
      onSuccess(response)
    } else {
      onErr(response as CheckLoginError)
    }
  } catch (error) {
    onErr(error)
  } finally {
    setState('idle')
  }
}

const pingLogin = retry(() => 5, check => check !== 'NotReady', checkLogin)

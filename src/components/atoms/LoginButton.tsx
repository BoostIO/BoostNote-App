import React, { useCallback } from 'react'
import { useLogin, User, useUsers } from 'Lib/accounts'
import { StyledComponent } from 'styled-components'

type RenderFunction<T> = (state: T) => React.ReactNode

interface LoginButtonProps {
  children?: React.ReactNode | RenderFunction<'idle' | 'logging-in'>
  onLoginStart?: () => void
  onLoginComplete?: (user: User) => void
  onErr?: (err: string) => void
  ButtonComponent?: StyledComponent<'button', any, any, any>
}

export default ({
  children,
  onLoginStart,
  onLoginComplete,
  onErr,
  ButtonComponent
}: LoginButtonProps) => {
  const [, { setUser }] = useUsers()
  const [loginState, initiateLogin] = useLogin(
    ({ token, user }) => {
      const newUser = { token, ...user }
      if (onLoginComplete != null) {
        onLoginComplete(newUser)
      }
      setUser(newUser)
    },
    err => (onErr != null ? onErr(err) : null)
  )

  if (children == null) {
    children = loginState === 'logging-in' ? 'Signing in...' : 'Sign in'
  }

  const startCallback = useCallback(() => {
    if (onLoginStart != null) {
      onLoginStart()
    }
    initiateLogin()
  }, [onLoginStart, initiateLogin])

  const content =
    typeof children === 'function' ? children(loginState) : children

  if (ButtonComponent == null) {
    return <button onClick={startCallback}>{content}</button>
  }

  return <ButtonComponent onClick={startCallback}>{content}</ButtonComponent>
}

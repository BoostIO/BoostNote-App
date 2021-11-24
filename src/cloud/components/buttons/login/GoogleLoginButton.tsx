import React, { useState } from 'react'
import cc from 'classcat'
import { stringify } from 'querystring'
import { mdiGoogle } from '@mdi/js'
import { boostHubBaseUrl } from '../../../lib/consts'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'

interface GoogleLoginButtonProps {
  redirectTo?: string
  isSignup?: boolean
  style?: React.CSSProperties
  className?: string
  query?: any
  disabled: boolean
  setDisabled: (val: boolean) => void
}

const GoogleLoginButton = ({
  className,
  style,
  query,
  disabled,
  setDisabled,
}: GoogleLoginButtonProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const loginHref = `${boostHubBaseUrl}/api/oauth/google${
    query != null ? `?${stringify(query)}` : ''
  }`

  return (
    <StyledGoogleButton
      onClick={() => {
        setDisabled(true)
        setSending(true)
      }}
      href={loginHref}
      disabled={disabled}
      style={style}
      className={cc(['login-google-btn', disabled && 'disabled', className])}
    >
      <Icon path={mdiGoogle} />
      {sending ? <span>Signing in...</span> : <span>Continue with Google</span>}
    </StyledGoogleButton>
  )
}

export default GoogleLoginButton

const StyledGoogleButton = styled.a`
  text-decoration: none;
  width: 100%;
  height: 40px;
  line-height: 10px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: #c5544c;
  color: #fff;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  outline: none !important;

  &:disabled {
    opacity: 0.3;
  }

  &:hover,
  &:focus {
    background-color: #933730;
  }

  svg,
  span {
    vertical-align: middle;
  }
  svg {
    font-size: 24px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
  span {
    display: inline-block;
  }
`

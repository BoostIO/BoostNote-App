import React, { useState } from 'react'
import cc from 'classcat'
import { stringify } from 'querystring'
import { mdiGithub } from '@mdi/js'
import { boostHubBaseUrl } from '../../../lib/consts'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'

interface GithubLoginButtonProps {
  query?: any
  style?: React.CSSProperties
  className?: string
  disabled: boolean
  setDisabled: (val: boolean) => void
}

const GithubLoginButton = ({
  query,
  className,
  style,
  disabled,
  setDisabled,
}: GithubLoginButtonProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const loginHref = `${boostHubBaseUrl}/api/oauth/github${
    query != null ? `?${stringify(query)}` : ''
  }`

  return (
    <StyledGithubButton
      style={style}
      className={cc(['login-github-btn', disabled && 'disabled', className])}
      onClick={() => {
        setDisabled(true)
        setSending(true)
      }}
      href={loginHref}
    >
      <Icon path={mdiGithub} />
      {sending ? <span>Signing in...</span> : <span>Continue with GitHub</span>}
    </StyledGithubButton>
  )
}

export default GithubLoginButton

const StyledGithubButton = styled.a`
  display: inline-block;
  text-decoration: none;
  width: 100%;
  height: 40px;
  line-height: 10px;
  text-align: center;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: #24292e;
  color: #fff;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  align-items: center;
  outline: 0;

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  &:hover,
  &:focus {
    background-color: #131619;
    color: #fff;
  }

  svg,
  span {
    vertical-align: middle;
  }
  svg {
    font-size: 26px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
  span {
    display: inline-block;
  }
`

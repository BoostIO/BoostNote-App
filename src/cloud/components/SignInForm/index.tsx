import React, { useState, useMemo } from 'react'
import GoogleLoginButton from '../buttons/login/GoogleLoginButton'
import GithubLoginButton from '../buttons/login/GithubLoginButton'
import styled from '../../../design/lib/styled'
import ErrorBlock from '../ErrorBlock'
import EmailForm from './EmailForm'
import { useRouter } from '../../lib/router'

interface SignInFormProps {
  isSignup?: boolean
  redirectTo?: string
  inviteId?: string
  openInviteSlug?: string
  disabled?: boolean
  width?: string
  mobile?: boolean
}

const SignInForm = ({
  isSignup = false,
  redirectTo,
  inviteId,
  disabled: preventAction = false,
  openInviteSlug,
  width = '400px',
  mobile,
}: SignInFormProps) => {
  const [error, setError] = useState<unknown>()
  const [disabled, setDisabled] = useState<boolean>(false)
  const { query } = useRouter()

  const loginQuery = useMemo(() => {
    const query: any = {}
    if (isSignup) {
      query.signup = true
    }

    if (redirectTo != null) {
      query.redirectTo = redirectTo
    }

    if (inviteId != null) {
      query.inviteId = inviteId
    }

    if (openInviteSlug != null) {
      query.openInviteSlug = openInviteSlug
    }
    if (mobile) {
      query.mobile = 'true'
    }
    return query
  }, [redirectTo, isSignup, inviteId, openInviteSlug, mobile])

  return (
    <>
      <StyledSignin style={{ width }}>
        <GoogleLoginButton
          disabled={disabled || preventAction}
          setDisabled={setDisabled}
          query={loginQuery}
          setError={setError}
          style={{ margin: '0 auto 10px', display: 'block' }}
        />
        <GithubLoginButton
          disabled={disabled || preventAction}
          setDisabled={setDisabled}
          query={loginQuery}
          style={{ margin: '0 auto 10px', display: 'block' }}
        />
        <hr />
        <EmailForm
          query={loginQuery}
          disabled={disabled || preventAction}
          setError={setError}
          setDisabled={setDisabled}
          email={typeof query.email === 'string' ? query.email : undefined}
        />
      </StyledSignin>

      {error != null && (
        <ErrorBlock
          error={error}
          style={{
            maxHeight: 200,
            overflow: 'auto',
          }}
        />
      )}
    </>
  )
}

const StyledSignin = styled.div`
  margin: 0 auto ${({ theme }) => theme.sizes.spaces.xsm}px;
  hr {
    background-color: #d2d3d6;
    height: 1px;
    border: none;
    margin: ${({ theme }) => theme.sizes.spaces.l}px auto;
    width: 400px;
  }
`

export default SignInForm

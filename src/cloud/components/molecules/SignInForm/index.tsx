import React, { useState, useMemo } from 'react'
import GoogleLoginButton from '../../atoms/buttons/login/GoogleLoginButton'
import GithubLoginButton from '../../atoms/buttons/login/GithubLoginButton'
import styled from '../../../lib/styled'
import ErrorBlock from '../../atoms/ErrorBlock'
import EmailForm from './EmailForm'
import { useRouter } from '../../../lib/router'

interface SignInFormProps {
  isSignup?: boolean
  redirectTo?: string
  inviteId?: string
  openInviteSlug?: string
  disabled?: boolean
}

const SignInForm = ({
  isSignup = false,
  redirectTo,
  inviteId,
  disabled: preventAction = false,
  openInviteSlug,
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
    return query
  }, [redirectTo, isSignup, inviteId, openInviteSlug])

  return (
    <>
      <StyledSignin style={{ marginBottom: 20 }}>
        <GoogleLoginButton
          disabled={disabled || preventAction}
          setDisabled={setDisabled}
          query={loginQuery}
          setError={setError}
          style={{ marginBottom: 10 }}
        />
        <GithubLoginButton
          disabled={disabled || preventAction}
          setDisabled={setDisabled}
          query={loginQuery}
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
            marginBottom: 20,
            maxHeight: 200,
            overflow: 'auto',
          }}
        />
      )}
    </>
  )
}

const StyledSignin = styled.div`
  margin: auto;
  hr {
    background-color: #d2d3d6;
    height: 1px;
    border: none;
    margin: 32px auto !important;
    width: 400px;
  }
`

export default SignInForm

import React, { useState } from 'react'
import Page from '../../../components/Page'
import Container from '../../../components/layouts/Container'
import Spinner from '../../../components/atoms/CustomSpinner'
import styled from '../../../lib/styled'
import { useEffectOnce } from 'react-use'
import ErrorPage from '../../../components/organisms/error/ErrorPage'
import { useRouter } from '../../../lib/router'

const AuthCallbackPage = () => {
  const [error, setError] = useState<any>()
  const { query } = useRouter()

  useEffectOnce(() => {
    if (window.opener == null) {
      setError('Could not contact parent')
      return
    }
    window.opener.postMessage(query)
  })

  if (error != null) {
    return <ErrorPage error={error} />
  }

  return (
    <Page>
      <Container>
        <StyledAuthCallbackPage>
          <StyledAuthCallbackCard>
            <h1 className='text-center'>Connecting Service....</h1>
            <div className='text-center'>
              <Spinner style={{ width: 45, height: 45 }} />
            </div>
          </StyledAuthCallbackCard>
        </StyledAuthCallbackPage>
      </Container>
    </Page>
  )
}

export const StyledAuthCallbackPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

export const StyledAuthCallbackCard = styled.div`
  background-color: ${({ theme }) => theme.subtleBackgroundColor};
  color: ${({ theme }) => theme.baseTextColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  width: 100%;
  max-width: 600px;
  padding: ${({ theme }) => theme.space.xlarge}px
    ${({ theme }) => theme.space.large}px;
  border-radius: 5px;
  text-align: center;
`

export default AuthCallbackPage

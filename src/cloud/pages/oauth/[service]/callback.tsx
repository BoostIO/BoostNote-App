import React, { useState } from 'react'
import Page from '../../../components/Page'
import Container from '../../../components/layouts/CenteredContainer'
import { useEffectOnce } from 'react-use'
import ErrorPage from '../../../components/error/ErrorPage'
import { useRouter } from '../../../lib/router'
import { boostHubBaseUrl } from '../../../lib/consts'
import Spinner from '../../../../design/components/atoms/Spinner'
import styled from '../../../../design/lib/styled'

const AuthCallbackPage = () => {
  const [error, setError] = useState<any>()
  const { query } = useRouter()

  useEffectOnce(() => {
    if (window.opener == null) {
      setError('Could not contact parent')
      return
    }
    window.opener.postMessage(query, boostHubBaseUrl)
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
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.colors.shadow};
  width: 100%;
  max-width: 600px;
  padding: ${({ theme }) => theme.sizes.spaces.xl}px
    ${({ theme }) => theme.sizes.spaces.l}px;
  border-radius: 5px;
  text-align: center;
`

export default AuthCallbackPage

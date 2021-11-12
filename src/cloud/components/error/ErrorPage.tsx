import React from 'react'
import Page from '../Page'
import { useGlobalData } from '../../lib/stores/globalData'
import { useRouter } from '../../lib/router'
import { ThemeProvider } from 'styled-components'
import SignInForm from '../SignInForm'
import { mockBackend, nodeEnv } from '../../lib/consts'
import { usingElectron } from '../../lib/stores/electron'
import { darkTheme } from '../../../design/lib/styled/dark'
import styled from '../../../design/lib/styled'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Button from '../../../design/components/atoms/Button'
import ErrorSection from './../error/ErrorSection'
import { initMockData } from '../../api/mock/db/init'

interface ErrorPageProps {
  error: Error
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  const {
    globalData: { currentUser, teams },
  } = useGlobalData()
  const { query, pathname, search } = useRouter()
  const { response } = error as any
  const statusCode = response != null ? response.status : null

  const homeUrl =
    currentUser == null
      ? '/'
      : teams.length > 0
      ? `/${teams[0].domain}`
      : '/cooperate'

  return (
    <ThemeProvider theme={darkTheme}>
      <Page
        title={`${
          statusCode != null ? `${statusCode} Error` : 'Error'
        } - Boost Note`}
      >
        <Container>
          {query.fromBoostHubDomain === 'true' && (
            <ColoredBlock variant='info'>
              We&apos;ve changed the Boost Hub domain to
              &lsquo;boostnote.io&rsquo;.
            </ColoredBlock>
          )}
          <h2 className='heading'>Something went wrong...</h2>
          <ErrorSection
            statusCode={statusCode}
            message={beautifyErrorMessage(error.message)}
            stack={nodeEnv === 'production' ? undefined : error.stack}
          />

          {usingElectron || statusCode == null ? (
            <Button
              variant='primary'
              onClick={() => {
                location.reload()
              }}
            >
              Reload
            </Button>
          ) : (
            <Button
              variant='primary'
              onClick={() => {
                window.location.href = homeUrl
              }}
            >
              {currentUser == null
                ? 'Go to homepage'
                : 'Go back to your default space'}
            </Button>
          )}
          {currentUser == null && statusCode === 401 && (
            <div className='text-center' style={{ marginTop: 20 }}>
              <h3>Or Sign up / in</h3>
              {usingElectron ? (
                <Button
                  variant='primary'
                  onClick={() => {
                    window.location.href = '/desktop'
                  }}
                >
                  Go to Sign in page
                </Button>
              ) : (
                <SignInForm redirectTo={pathname + search} />
              )}
            </div>
          )}
          {mockBackend && (
            <Button
              onClick={() => {
                initMockData()
                window.location.reload()
              }}
            >
              Reset Mock Data
            </Button>
          )}
        </Container>
      </Page>
    </ThemeProvider>
  )
}

export default ErrorPage

const Container = styled.div`
  max-width: 720px;
  padding: 10px;
  margin: 0 auto;
  position: relative;
`

function beautifyErrorMessage(errorMessage: string) {
  switch (errorMessage) {
    case 'Forbidden':
      return "You are not allowed to access this resource. The resource might not exist or you don't have a right to access."
    case 'Unauthorized':
      return 'Please sign up/in to access the resource.'
    case 'Failed to fetch':
      return 'Failed to fetch page data. Please check your internet connection.'
    default:
      return errorMessage
  }
}

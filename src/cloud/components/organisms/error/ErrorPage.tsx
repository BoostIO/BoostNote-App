import React from 'react'
import Page from '../../Page'
import ErrorSection from './ErrorSection'
import { darkTheme } from '../../../lib/styled'
import DefaultLayout from '../../layouts/DefaultLayout'
import { useGlobalData } from '../../../lib/stores/globalData'
import { useRouter } from '../../../lib/router'
import ColoredBlock from '../../atoms/ColoredBlock'
import { ThemeProvider } from 'styled-components'
import ButtonLink from '../../atoms/ButtonLink'

interface ErrorPageProps {
  error: Error
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  const {
    globalData: { currentUser, teams },
  } = useGlobalData()
  const { query } = useRouter()
  const { response } = error as any
  const statusCode = response != null ? response.status : null

  return (
    <ThemeProvider theme={darkTheme}>
      <Page
        title={`${
          statusCode != null ? `${statusCode} Error` : 'Error'
        } - Boost Note`}
      >
        <DefaultLayout>
          {query.fromBoostHubDomain === 'true' && (
            <ColoredBlock variant='info'>
              We&apos;ve changed the Boost Hub domain to
              &lsquo;boostnote.io&rsquo;.
            </ColoredBlock>
          )}
          <h2 className='heading'>Something went wrong...</h2>
          <ErrorSection
            statusCode={statusCode}
            message={error.message}
            stack={error.stack}
          />

          {statusCode == null ? (
            <ButtonLink
              onClick={() => {
                location.reload()
              }}
              style={{
                display: 'flex',
                margin: '40px auto 20px',
                width: 200,
              }}
            >
              Reload
            </ButtonLink>
          ) : (
            <ButtonLink
              variant='primary'
              href={
                currentUser == null
                  ? '/'
                  : teams.length > 0
                  ? `/${teams[0].domain}`
                  : '/cooperate'
              }
              style={{
                display: 'flex',
                margin: '40px auto 20px',
                width: 200,
              }}
            >
              {currentUser == null ? 'Go to homepage' : 'Go to workspace'}
            </ButtonLink>
          )}
          {currentUser == null && statusCode === 401 && (
            <div className='text-center' style={{ marginTop: 20 }}>
              <h3>Or Sign in</h3>
              {/* <SignInForm redirectTo={pathname} /> */}
            </div>
          )}
        </DefaultLayout>
      </Page>
    </ThemeProvider>
  )
}

export default ErrorPage

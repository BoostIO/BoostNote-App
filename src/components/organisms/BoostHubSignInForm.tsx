import React, {
  useCallback,
  useRef,
  useState,
  ChangeEventHandler,
  useEffect,
} from 'react'
import { setAsDefaultProtocolClient } from '../../lib/electronOnly'
import { usePreferences } from '../../lib/preferences'
import {
  FormPrimaryButton,
  FormGroup,
  FormTextInput,
  FormBlockquote,
  FormSecondaryButton,
} from '../atoms/form'
import { generateId } from '../../lib/string'
import { openLoginPage, useBoostHub } from '../../lib/boosthub'
import { useGeneralStatus } from '../../lib/generalStatus'
import {
  BoostHubLoginEvent,
  listenBoostHubLoginEvent,
  unlistenBoostHubLoginEvent,
  listenBoostHubLoginRequestEvent,
  unlistenBoostHubLoginRequestEvent,
} from '../../lib/events'
import { useRouter } from '../../lib/router'
import Icon from '../atoms/Icon'
import { mdiLoading } from '@mdi/js'
import BoostHubFeatureIntro from '../molecules/BoostHubFeatureIntro'
import styled from '../../lib/styled'

const BoostHubSignInForm = () => {
  const { setPreferences } = usePreferences()
  const { setGeneralStatus } = useGeneralStatus()
  const authStateRef = useRef('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'requesting' | 'logging-in'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualFormOpened, setManualFormOpened] = useState(false)
  const { push } = useRouter()
  const { sendSignInRequest } = useBoostHub()

  const startLoginRequest = useCallback(async () => {
    setStatus('requesting')
    setErrorMessage(null)
    setAsDefaultProtocolClient('boostnote')
    const authState = generateId()
    authStateRef.current = authState
    openLoginPage(authState)
  }, [])

  const openLoginRequestPage = useCallback(() => {
    openLoginPage(authStateRef.current)
  }, [])

  const updateCode: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setCode(event.target.value)
    },
    []
  )

  const login = useCallback(
    async (code: string) => {
      setStatus('logging-in')
      setErrorMessage(null)
      try {
        const { user, teams } = await sendSignInRequest(
          authStateRef.current,
          code
        )
        setPreferences({
          'boosthub.user': {
            id: user.id,
            uniqueName: user.uniqueName,
            displayName: user.displayName,
          },
        })
        setGeneralStatus({
          boostHubTeams: teams.map((team) => {
            return {
              id: team.id,
              name: team.name,
              domain: team.domain,
            }
          }),
        })
        if (teams.length > 0) {
          push(`/app/boosthub/teams/${teams[0].domain}`)
        } else {
          push(`/app/boosthub/teams`)
        }
      } catch (error) {
        console.error('Failed to log in', error)
        setStatus('requesting')
        setErrorMessage(
          error.response != null ? await error.response.text() : error.message
        )
      }
    },
    [setPreferences, setGeneralStatus, push, sendSignInRequest]
  )

  useEffect(() => {
    const handler = (event: BoostHubLoginEvent) => {
      login(event.detail.code)
    }
    listenBoostHubLoginEvent(handler)

    return () => {
      unlistenBoostHubLoginEvent(handler)
    }
  }, [login])

  useEffect(() => {
    const handler = () => {
      startLoginRequest()
    }
    listenBoostHubLoginRequestEvent(handler)

    return () => {
      unlistenBoostHubLoginRequestEvent(handler)
    }
  }, [startLoginRequest])

  return (
    <Container>
      <h1 className='heading'>Craete Team Account</h1>
      {status === 'idle' ? (
        <>
          <div style={{ maxWidth: '1020px' }}>
            <BoostHubFeatureIntro />
          </div>
          <div className='control'>
            <FormPrimaryButton onClick={startLoginRequest}>
              Sign Up
            </FormPrimaryButton>

            <FormSecondaryButton onClick={startLoginRequest}>
              Sign In
            </FormSecondaryButton>
          </div>
        </>
      ) : status === 'logging-in' ? (
        <p>
          <Icon path={mdiLoading} spin />
          &nbsp;Signing In...
        </p>
      ) : (
        <>
          <p style={{ textAlign: 'center' }}>
            <Icon path={mdiLoading} spin />
            &nbsp;Waiting for signing in from browser...
          </p>
          <FormGroup style={{ textAlign: 'center' }}>
            <FormPrimaryButton onClick={openLoginRequestPage}>
              Open request signing in page again
            </FormPrimaryButton>
          </FormGroup>
          {errorMessage != null && (
            <FormGroup style={{ textAlign: 'center' }}>
              <FormBlockquote variant='danger'>{errorMessage}</FormBlockquote>
            </FormGroup>
          )}
          {manualFormOpened ? (
            <>
              <hr />
              <FormGroup style={{ textAlign: 'center' }}>
                <FormTextInput
                  placeholder='Insert Code from the browser'
                  value={code}
                  onChange={updateCode}
                />
              </FormGroup>
              <FormGroup style={{ textAlign: 'center' }}>
                <FormPrimaryButton
                  onClick={() => {
                    login(code)
                  }}
                >
                  Sign In
                </FormPrimaryButton>
              </FormGroup>
            </>
          ) : (
            <FormGroup style={{ textAlign: 'center' }}>
              <FormBlockquote>
                Click{' '}
                <a
                  onClick={() => {
                    setCode('')
                    setManualFormOpened(true)
                  }}
                  style={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  here
                </a>{' '}
                to type sign-in code manually
              </FormBlockquote>
            </FormGroup>
          )}
        </>
      )}
    </Container>
  )
}

export default BoostHubSignInForm

const Container = styled.div`
  & > .heading {
    text-align: center;
    margin-bottom: 20px;
    font-size: 36px;
  }

  & > .control {
    margin: 10px auto;
    text-align: center;
    & > button {
      padding-right: 30px;
      padding-left: 30px;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
  blockquote {
    margin-right: 0;
  }
`

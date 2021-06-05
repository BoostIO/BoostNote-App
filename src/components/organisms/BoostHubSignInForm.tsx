import React, {
  useCallback,
  useRef,
  useState,
  ChangeEventHandler,
  useEffect,
} from 'react'
import { setAsDefaultProtocolClient, setCookie } from '../../lib/electronOnly'
import { usePreferences } from '../../lib/preferences'
import { FormGroup, FormTextInput, FormBlockquote } from '../atoms/form'
import { generateId } from '../../lib/string'
import {
  openLoginPage,
  createDesktopAccessToken,
  getBoostHubTeamIconUrl,
} from '../../lib/boosthub'
import { useGeneralStatus } from '../../lib/generalStatus'
import {
  BoostHubLoginEvent,
  boostHubLoginEventEmitter,
  boostHubLoginRequestEventEmitter,
} from '../../lib/events'
import { useRouter } from '../../lib/router'
import { mdiLoading } from '@mdi/js'
import BoostHubFeatureIntro from '../molecules/BoostHubFeatureIntro'
import { osName } from '../../lib/platform'
import { fetchDesktopGlobalData } from '../../lib/boosthub'
import { boostHubBaseUrl } from '../../cloud/lib/consts'
import Icon from '../../shared/components/atoms/Icon'
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'

const BoostHubSignInForm = () => {
  const { setPreferences } = usePreferences()
  const { setGeneralStatus } = useGeneralStatus()
  const authStateRef = useRef('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'requesting' | 'logging-in'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualFormOpened, setManualFormOpened] = useState(() => {
    switch (osName) {
      case 'macos':
      case 'windows':
        return false
      case 'linux':
      case 'unix':
      default:
        return true
    }
  })
  const { push } = useRouter()

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
        const { token } = await createDesktopAccessToken(
          authStateRef.current,
          code
        )

        setCookie({
          url: boostHubBaseUrl,
          name: 'desktop_access_token',
          value: token,
          expirationDate: 4766076898395,
        })

        const { user, teams } = await fetchDesktopGlobalData(token)
        if (user == null) {
          // Handle when token is invalidated
          return
        }
        setPreferences({
          'cloud.user': {
            id: user.id,
            uniqueName: user.uniqueName,
            displayName: user.displayName,
            accessToken: token,
          },
        })
        setGeneralStatus({
          boostHubTeams: teams.map((team) => {
            return {
              id: team.id,
              name: team.name,
              domain: team.domain,
              createdAt: team.createdAt,
              iconUrl:
                team.icon != null
                  ? getBoostHubTeamIconUrl(team.icon.location)
                  : undefined,
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
    [setPreferences, setGeneralStatus, push]
  )

  useEffect(() => {
    const handler = (event: BoostHubLoginEvent) => {
      login(event.detail.code)
    }
    boostHubLoginEventEmitter.listen(handler)

    return () => {
      boostHubLoginEventEmitter.unlisten(handler)
    }
  }, [login])

  useEffect(() => {
    const handler = () => {
      startLoginRequest()
    }
    boostHubLoginRequestEventEmitter.listen(handler)

    return () => {
      boostHubLoginRequestEventEmitter.unlisten(handler)
    }
  }, [startLoginRequest])

  const cancelSigningIn = useCallback(() => {
    setStatus('idle')
  }, [])

  const navigateToCreateLocalSpacePage = useCallback(() => {
    push('/app/storages')
  }, [push])

  return (
    <Container>
      <h1 className='heading'>Create Account</h1>
      {status === 'idle' ? (
        <>
          <div style={{ maxWidth: '1020px' }}>
            <BoostHubFeatureIntro />
          </div>
          <div className='control'>
            <Button variant={'primary'} onClick={startLoginRequest}>
              Sign Up
            </Button>

            <Button variant={'secondary'} onClick={startLoginRequest}>
              Sign In
            </Button>
          </div>
          <div className='control'>
            <a
              className='control-link'
              onClick={navigateToCreateLocalSpacePage}
            >
              Create a local space without creating an account
            </a>
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
            <Button variant={'primary'} onClick={openLoginRequestPage}>
              Open request signing in page again
            </Button>
          </FormGroup>
          <FormGroup style={{ textAlign: 'center' }}>
            <a className='control-link' onClick={cancelSigningIn}>
              Cancel Signing In
            </a>
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
                <Button
                  variant={'primary'}
                  onClick={() => {
                    login(code)
                  }}
                >
                  Sign In
                </Button>
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
  .control-link {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 30px;
    margin-left: 40px;
    color: ${({ theme }) => theme.colors.text.primary};
    &:hover {
      color: ${({ theme }) => theme.colors.text.link};
    }
    cursor: pointer;
  }
  blockquote {
    margin-right: 0;
  }
`

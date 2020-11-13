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
} from '../atoms/form'
import { generateId } from '../../lib/string'
import { sendLoginRequest, openLoginPage } from '../../lib/boosthub'
import { useGeneralStatus } from '../../lib/generalStatus'
import {
  BoostHubLoginEvent,
  listenBoostHubLoginEvent,
  unlistenBoostHubLoginEvent,
} from '../../lib/events'

const BoostHubSignInForm = () => {
  const { setPreferences } = usePreferences()
  const { setGeneralStatus } = useGeneralStatus()
  const authStateRef = useRef('')
  const [code, setCode] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [manualFormOpened, setManualFormOpened] = useState(false)

  const startLoginRequest = useCallback(async () => {
    setRequesting(true)
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
      try {
        const { user, teams } = await sendLoginRequest(
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
      } catch (error) {
        console.error('Failed to log in', error)
      }
    },
    [setPreferences, setGeneralStatus]
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

  return (
    <>
      {requesting ? (
        <>
          <p>Waiting for signing in from browser...</p>
          <FormGroup>
            <FormPrimaryButton onClick={openLoginRequestPage}>
              Open sign in page again
            </FormPrimaryButton>
          </FormGroup>
          {manualFormOpened ? (
            <>
              <FormGroup>
                <FormTextInput value={code} onChange={updateCode} />
              </FormGroup>
              <FormGroup>
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
            <FormGroup>
              <FormBlockquote>
                <a
                  onClick={() => {
                    setCode('')
                    setManualFormOpened(true)
                  }}
                >
                  Click here
                </a>{' '}
                to sign in manually
              </FormBlockquote>
            </FormGroup>
          )}
        </>
      ) : (
        <FormGroup>
          <FormPrimaryButton onClick={startLoginRequest}>
            Sign Up/In
          </FormPrimaryButton>
        </FormGroup>
      )}
    </>
  )
}

export default BoostHubSignInForm

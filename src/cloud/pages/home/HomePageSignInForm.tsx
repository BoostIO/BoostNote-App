import React, { ChangeEventHandler, useCallback, useRef, useState } from 'react'
import styled from '../../../design/lib/styled'
import Button from '../../../design/components/atoms/Button'
import { generateId } from '../../../lib/string'
import { loginRequest, loginWithStateAndCode } from '../../api/desktop/login'
import { useElectron } from '../../lib/stores/electron'
import { osName } from '../../../design/lib/platform'
import Icon from '../../../design/components/atoms/Icon'
import { mdiLoading } from '@mdi/js'
import {
  FormBlockquote,
  FormGroup,
  FormTextInput,
} from '../../../components/atoms/form'
import { useRouter } from '../../lib/router'
import { useGlobalData } from '../../lib/stores/globalData'
import BoostNoteFeatureIntro from './BoostNoteFeatureIntro'
import { flexCenter } from '../../../design/lib/styled/styleFunctions'

const HomePageSignInForm = () => {
  const { sendToElectron, usingElectron } = useElectron()
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
  const { setPartialGlobalData } = useGlobalData()

  const openLoginPage = useCallback(
    async (authState) => {
      const loginRequestUrl = await loginRequest(authState)
      if (usingElectron) {
        sendToElectron('open-external-url', loginRequestUrl)
      }
    },
    [sendToElectron, usingElectron]
  )

  const startLoginRequest = useCallback(async () => {
    setStatus('requesting')
    setErrorMessage(null)
    const authState = generateId()
    authStateRef.current = authState
    await openLoginPage(authState)
  }, [openLoginPage])

  const onSignIn = useCallback(() => {
    startLoginRequest().catch((err) => console.log('Cannot log in', err))
  }, [startLoginRequest])

  const openLoginRequestPage = useCallback(async () => {
    await openLoginPage(authStateRef.current)
  }, [openLoginPage])

  const updateCode: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setCode(event.target.value)
    },
    []
  )

  const cancelSigningIn = useCallback(() => {
    setStatus('idle')
  }, [])

  const login = useCallback(
    (code) => {
      setStatus('logging-in')
      setErrorMessage(null)
      loginWithStateAndCode(authStateRef.current, code)
        .then((loginData) => {
          // todo: [komediruzecki-2021-10-14] After logout it is still logged in (need to invalidate token probably)
          setPartialGlobalData({
            currentUser: loginData.user || undefined,
            teams: loginData.teams || [],
          })
          push('/desktop')
        })
        .catch((err) => console.log('Error logging in', err))
    },
    [push, setPartialGlobalData]
  )

  return (
    <PageContainer>
      <Container>
        <h1 className='heading'>Create Account or Sign in</h1>
        {status === 'idle' ? (
          <>
            <div style={{ maxWidth: '1020px' }}>
              <BoostNoteFeatureIntro />
            </div>
            <div className='control'>
              <Button variant={'primary'} onClick={() => onSignIn()}>
                Sign Up
              </Button>

              <Button variant={'secondary'} onClick={() => onSignIn()}>
                Sign In
              </Button>
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
    </PageContainer>
  )
}

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  ${flexCenter}
`

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

export default HomePageSignInForm

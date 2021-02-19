import React, { useState, useCallback } from 'react'
import {
  SharePageDataResponseBody,
  getSharedPagedData,
} from '../../api/pages/shared'
import { StyledDocPage } from '../../components/organisms/DocPage/styles'
import SharePageTopbar from '../../components/organisms/SharePageTopBar'
import SharedDocPage from '../../components/organisms/DocPage/SharedDocPage'
import styled from '../../lib/styled'
import Icon from '../../components/atoms/Icon'
import { mdiLockOutline } from '@mdi/js'
import { inputStyle, primaryButtonStyle } from '../../lib/styled/styleFunctions'
import { getSharedLink } from '../../api/share'
import { Spinner } from '../../components/atoms/Spinner'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const SharedPage = (props: SharePageDataResponseBody) => {
  const [fetching, setFetching] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState(() => {
    return 'token' in props ? props.token : null
  })

  const [currentDoc, setCurrentDoc] = useState(() => {
    if ('doc' in props) {
      return props.doc
    }
    return null
  })

  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPassword(event.target.value)
    },
    []
  )

  const onSubmitPassword: React.FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault()
      if (fetching) {
        return
      }

      if (password.trim() === '') {
        setError('Please fill in the password.')
      }

      setError(null)
      setFetching(true)
      try {
        const { link, token } = await getSharedLink(props.link, {
          password,
        })
        if (link.doc != null) {
          setCurrentDoc(link.doc)
          setToken(token)
        }
      } catch {
        setError('Password is incorrect')
      }
      setFetching(false)
    },
    [fetching, password, props.link]
  )

  if (currentDoc != null && token != null) {
    return <SharedDocPage doc={currentDoc} token={token} />
  }
  return (
    <StyledDocPage>
      <SharePageTopbar />
      <Container>
        <div className='share__card'>
          <Icon className='share__card__icon' path={mdiLockOutline} size={72} />
          <div className='share__card__heading'>
            This link is password protected
          </div>
          <p className='share__card__description'>
            Enter the password below to view this document
          </p>
          <form className='share__link__form' onSubmit={onSubmitPassword}>
            <label className='share__card__label' htmlFor='password-input'>
              Password
            </label>
            <input
              type='text'
              value={password}
              disabled={fetching}
              onChange={onPasswordChange}
              id='password-input'
              className='share__card__row'
              autoComplete='off'
            />
            {error != null && (
              <div className='share__link__form__error share__card__row'>
                {error}
              </div>
            )}
            <button
              type='submit'
              className='share__card__row'
              disabled={fetching}
            >
              {fetching ? (
                <Spinner className='relative spinner' />
              ) : (
                'View this document'
              )}
            </button>
          </form>
        </div>
      </Container>
    </StyledDocPage>
  )
}

SharedPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getSharedPagedData(params)
  return result
}

const Container = styled.div`
  width: 100%;
  flex: 1 1 auto;

  .share__card {
    margin-top: ${({ theme }) => theme.space.default}px;
    margin-left: auto;
    margin-right: auto;
    width: 96%;
    max-width: 600px;
    text-align: center;
  }

  .share__card__icon {
    color: ${({ theme }) => theme.subtleIconColor};
  }

  .share__card__heading {
    font-size: ${({ theme }) => theme.fontSizes.xxxlarge}px;
    margin: ${({ theme }) => theme.space.default}px 0;
  }

  .share__link__form {
    text-align: left;
    width: 100%;

    .share__link__form__error {
      text-align: center;
      color: ${({ theme }) => theme.dangerBackgroundColor};
    }

    input {
      ${inputStyle}
      width: 100%;
      height: 40px;
      padding: 0 ${({ theme }) => theme.space.xsmall}px;
    }

    button[type='submit'] {
      ${primaryButtonStyle};
      width: 100%;
      height: 40px;
      border-radius: 3px;
    }
  }

  .share__card__row + .share__card__row {
    margin-top: ${({ theme }) => theme.space.default}px;
  }

  .share__card__label {
    color: ${({ theme }) => theme.subtleTextColor};
    display: block;
  }
`

export default SharedPage

import React, { useState, useCallback } from 'react'
import {
  SharePageDataResponseBody,
  getSharedPagedData,
} from '../../api/pages/shared'
import { StyledDocPage } from '../../components/DocPage/styles'
import SharePageTopbar from '../../components/SharePageTopBar'
import SharedDocPage from '../../components/DocPage/SharedDocPage'
import { mdiLockOutline } from '@mdi/js'
import { getSharedLink } from '../../api/share'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { LoadingButton } from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'
import Icon from '../../../design/components/atoms/Icon'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'

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
          <Icon
            className='share__card__icon'
            path={mdiLockOutline}
            size={100}
          />
          <div className='share__card__heading'>
            This link is password protected
          </div>
          <p className='share__card__description'>
            Enter the password below to view this document
          </p>
          <Form className='share__link__form' onSubmit={onSubmitPassword}>
            <FormRow
              row={{
                title: 'Password',
                items: [
                  {
                    type: 'input',
                    props: {
                      type: 'text',
                      value: password,
                      disabled: fetching,
                      onChange: onPasswordChange,
                      id: 'password-input',
                      className: 'share__card__row',
                      autoComplete: 'off',
                    },
                  },
                ],
              }}
              fullWidth={true}
            />
            {error != null && (
              <FormRow className='share__link__form__error share__card__row'>
                {error}
              </FormRow>
            )}
            <FormRow>
              <LoadingButton
                type='submit'
                className='share__card__row'
                disabled={fetching}
                spinning={fetching}
                variant='primary'
              >
                View this document
              </LoadingButton>
            </FormRow>
          </Form>
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
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    margin-left: auto;
    margin-right: auto;
    width: 96%;
    max-width: 600px;
    text-align: center;
  }

  .share__card__heading {
    font-size: ${({ theme }) => theme.sizes.spaces.xl}px;
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
  }

  .share__link__form {
    text-align: left;
    width: 100%;

    .share__link__form__error {
      text-align: center;
      color: ${({ theme }) => theme.colors.variants.danger.base};
    }
  }
`

export default SharedPage

import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import ky from 'ky-universal'
import { useTranslation } from 'react-i18next'

import styled from '../../lib/styled'
import { SpaceProps, space } from 'styled-system'
import FlexBox from '../atoms/FlexBox'
import Text from '../atoms/Text'
import Button from '../atoms/Button'
type Status = 'idle' | 'sending' | 'done'

const SubscribeInput = styled.input<SpaceProps>`
  ${space}
  padding: 1em;
  display: inline-block;
  height: 41px;
  border-radius: 4px;
  border: solid 1px ${({ theme }) => theme.colors.gray};
  white-space: nowrap;
  font-family: SFMono-Regular, Consolas, Liberation, Mono, Menlo, monospace;
  margin-right: 0.5em;

  @media only screen and (min-width: 768px) {
    width: 400px;
  }
`

const SubscribeNewsLettersForm = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const { t } = useTranslation()

  const subscribe = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatus('sending')
      setErrorMessage(null)

      try {
        await ky.post(
          'https://boostmails.boostio.co/api/public/lists/5f434dccd05f3160b41c0d49/subscriptions',
          {
            headers: {},
            json: {
              email,
            },
            credentials: 'omit',
          }
        )
        setStatus('done')
      } catch (error) {
        console.error(error)
        setErrorMessage(error.message)
        setStatus('idle')
      }
    },
    [email]
  )

  const updateEmail = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }, [])

  return (
    <>
      {status === 'done' ? (
        <FlexBox justifyContent='center' mt={2}>
          <Text as='p'>{t('newsletter.subscribed')}</Text>
        </FlexBox>
      ) : (
        <>
          <FlexBox justifyContent='center' mt={2}>
            <form onSubmit={subscribe}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SubscribeInput
                  py='2'
                  onChange={updateEmail}
                  placeholder='E-mail'
                  style={{ marginRight: '0.5em' }}
                />
                <Button
                  type='submit'
                  bg='teal'
                  color='white'
                  py='2'
                  fontSize={1}
                  disabled={status === 'sending'}
                >
                  {t('newsletter.buttonText')}
                </Button>
              </div>
            </form>
          </FlexBox>
          {errorMessage != null && (
            <FlexBox justifyContent='center'>
              <Text as='p' color='#dc3545'>
                {errorMessage}
              </Text>
            </FlexBox>
          )}
        </>
      )}
    </>
  )
}

export default SubscribeNewsLettersForm

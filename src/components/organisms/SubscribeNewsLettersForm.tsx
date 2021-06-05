import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionHeader, SectionInput } from '../PreferencesModal/styled'
import ky from 'ky'
import { FormBlockquote } from '../atoms/form'
import Button from '../../shared/components/atoms/Button'

type Status = 'idle' | 'sending' | 'done'

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
            json: {
              email,
            },
          }
        )
        setStatus('done')
      } catch (error) {
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
    <div>
      <SectionHeader>{t('newsletter.heading')}</SectionHeader>
      {status === 'done' ? (
        <FormBlockquote>{t('newsletter.subscribed')}</FormBlockquote>
      ) : (
        <>
          {errorMessage != null && (
            <FormBlockquote variant='danger'>{errorMessage}</FormBlockquote>
          )}
          <form onSubmit={subscribe}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SectionInput
                onChange={updateEmail}
                placeholder='E-mail'
                style={{ marginRight: '0.5em' }}
              />
              <Button
                variant={'primary'}
                type='submit'
                disabled={status === 'sending'}
              >
                {t('newsletter.subscribe')}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default SubscribeNewsLettersForm

import React, { FormEvent, useState, useCallback, useRef } from 'react'
import { registerAppFeedback } from '../../../api/users/appfeedback'
import { AppFeedbackTypeOption } from '../../../interfaces/db/userAppFeedback'
import ColoredBlock from '../../atoms/ColoredBlock'
import { useEffectOnce } from 'react-use'
import { useToast } from '../../../../shared/lib/stores/toast'
import Form from '../../../../shared/components/molecules/Form'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import Button from '../../../../shared/components/atoms/Button'
import { FormSelectOption } from '../../../../shared/components/molecules/Form/atoms/FormSelect'

const AppFeedbackForm = () => {
  const { t } = useI18n()

  const [feedbackType, setFeedbackType] = useState<FormSelectOption>({
    label: t(lngKeys.CommunityFeatureRequests),
    value: 'Feature Request',
  })
  const [feedback, setFeedback] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const { pushMessage } = useToast()
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false)
  const freeFormRef = useRef<HTMLTextAreaElement>(null)

  useEffectOnce(() => {
    if (freeFormRef.current != null) {
      freeFormRef.current.focus()
    }
  })

  const sendFeedback = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (sending || feedback.trim() === '') {
        return
      }
      setSending(true)
      try {
        await registerAppFeedback({
          type: feedbackType.value as AppFeedbackTypeOption,
          feedback,
        })
        setShowSuccessMessage(true)
      } catch (error) {
        pushMessage({
          title: t(lngKeys.GeneralError),
          description: t(lngKeys.CommunityFeedbackSendError),
        })
      }
      setSending(false)
    },
    [
      setSending,
      pushMessage,
      sending,
      feedback,
      feedbackType,
      setShowSuccessMessage,
      t,
    ]
  )

  const feedbackTypeChangeHandler = useCallback(
    async (value: FormSelectOption) => {
      setFeedbackType(value)
    },
    []
  )

  const feedbackOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.preventDefault()
      setFeedback(event.target.value)
    },
    []
  )

  const resetForm = useCallback(() => {
    setFeedbackType({
      label: t(lngKeys.CommunityFeatureRequests),
      value: 'Feature Request',
    })
    setFeedback('')
    setShowSuccessMessage(false)
  }, [t])

  if (showSuccessMessage) {
    return (
      <div>
        <ColoredBlock variant='success'>
          {t(lngKeys.CommunityFeedbackSendSuccess)}
        </ColoredBlock>

        <Button variant='secondary' onClick={resetForm}>
          {t(lngKeys.SendMore)}
        </Button>
      </div>
    )
  }

  return (
    <Form
      onSubmit={sendFeedback}
      rows={[
        {
          title: t(lngKeys.CommunityFeedbackType),
          items: [
            {
              type: 'select',
              props: {
                value: feedbackType,
                onChange: feedbackTypeChangeHandler,
                options: [
                  {
                    label: t(lngKeys.CommunityFeatureRequests),
                    value: 'Feature Request',
                  },
                  {
                    label: t(lngKeys.CommunityBugReport),
                    value: 'Bug Report',
                  },
                ],
              },
            },
          ],
        },
        {
          title: t(lngKeys.CommunityFeedbackFreeForm),
          items: [
            {
              type: 'textarea',
              props: {
                value: feedback,
                onChange: feedbackOnChangeEvent,
                ref: freeFormRef,
              },
            },
          ],
        },
      ]}
      submitButton={{ label: t(lngKeys.Send) }}
    />
  )
}

export default AppFeedbackForm

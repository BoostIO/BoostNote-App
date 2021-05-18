import React, { FormEvent, useState, useCallback, useRef } from 'react'
import CustomButton from '../../atoms/buttons/CustomButton'
import { registerAppFeedback } from '../../../api/users/appfeedback'
import { AppFeedbackTypeOption } from '../../../interfaces/db/userAppFeedback'
import ColoredBlock from '../../atoms/ColoredBlock'
import { useEffectOnce } from 'react-use'
import { useToast } from '../../../../shared/lib/stores/toast'
import Form from '../../../../shared/components/molecules/Form'

const typeOptions: AppFeedbackTypeOption[] = ['Feature Request', 'Bug Report']

const AppFeedbackForm = () => {
  const [feedbackType, setFeedbackType] = useState<AppFeedbackTypeOption>(
    'Feature Request'
  )
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
        await registerAppFeedback({ type: feedbackType, feedback })
        setShowSuccessMessage(true)
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: `Could not send your feedback`,
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
    ]
  )

  const feedbackTypeChangeHandler = useCallback(async (value: string) => {
    setFeedbackType(value as AppFeedbackTypeOption)
  }, [])

  const feedbackOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.preventDefault()
      setFeedback(event.target.value)
    },
    []
  )

  const resetForm = useCallback(() => {
    setFeedbackType('Feature Request')
    setFeedback('')
    setShowSuccessMessage(false)
  }, [])

  if (showSuccessMessage) {
    return (
      <div>
        <ColoredBlock variant='success'>
          Your feedback is always appreciated! Thank you for reaching out.
        </ColoredBlock>

        <CustomButton variant='secondary' onClick={resetForm}>
          Send more
        </CustomButton>
      </div>
    )
  }

  return (
    <Form
      onSubmit={sendFeedback}
      rows={[
        {
          title: 'Type of Feedback',
          items: [
            {
              type: 'select--string',
              props: {
                value: feedbackType,
                onChange: feedbackTypeChangeHandler,
                options: typeOptions,
              },
            },
          ],
        },
        {
          title: 'Free Form',
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
      submitButton={{ label: 'Send' }}
    />
  )
}

export default AppFeedbackForm

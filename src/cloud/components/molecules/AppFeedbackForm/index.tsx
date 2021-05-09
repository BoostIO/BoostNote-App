import React, { FormEvent, useState, useCallback, useRef } from 'react'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'
import { StyledAppFeedbackForm } from './styled'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { registerAppFeedback } from '../../../api/users/appfeedback'
import { AppFeedbackTypeOption } from '../../../interfaces/db/userAppFeedback'
import ColoredBlock from '../../atoms/ColoredBlock'
import { useEffectOnce } from 'react-use'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingSelect from '../../../../shared/components/organisms/Settings/atoms/SettingSelect'
import SettingTextarea from '../../../../shared/components/organisms/Settings/atoms/SettingTextarea'

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

  const feedbackTypeChangeHandler: SelectChangeEventHandler = useCallback(
    async (event) => {
      event.preventDefault()
      setFeedbackType(event.target.value as AppFeedbackTypeOption)
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
    <StyledAppFeedbackForm onSubmit={sendFeedback}>
      <h2>Type of feedback</h2>
      <SettingSelect
        value={feedbackType}
        onChange={feedbackTypeChangeHandler}
        options={
          <>
            {typeOptions.map((val) => (
              <option key={`select-type-${val}`} value={val}>
                {val}
              </option>
            ))}
          </>
        }
      ></SettingSelect>

      <h2>Free form</h2>
      <SettingTextarea
        value={feedback}
        ref={freeFormRef}
        onChange={feedbackOnChangeEvent}
      />

      <div className='submit-row'>
        <CustomButton
          type='submit'
          variant='primary'
          className='submit-feedback'
          disabled={sending}
        >
          {sending ? <Spinner /> : 'Send'}
        </CustomButton>
      </div>
      <div className='clear' />
    </StyledAppFeedbackForm>
  )
}

export default AppFeedbackForm

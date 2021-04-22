import React, { useState, useCallback } from 'react'
import {
  SectionIntroduction,
  SectionFlexRow,
  SectionFlexDualButtons,
} from '../../organisms/settings/styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { StyledBillingInput } from '.'
import { Spinner } from '../../atoms/Spinner'
import { updateSubEmail } from '../../../api/teams/subscription/update'
import { useToast } from '../../../../shared/lib/stores/toast'

interface UpdateBillingEmailFormProps {
  sub?: SerializedSubscription
  onSuccess: (subscription: SerializedSubscription) => void
  onCancel: () => void
}

const UpdateBillingEmailForm = ({
  sub,
  onSuccess,
  onCancel,
}: UpdateBillingEmailFormProps) => {
  const { pushApiErrorMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const [email, setEmail] = useState<string>(sub != null ? sub.email : '')

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (sub == null) {
      return
    }

    try {
      setSending(true)
      const { subscription } = await updateSubEmail(sub.teamId, email)
      onSuccess(subscription)
    } catch (error) {
      pushApiErrorMessage(error)
      setSending(false)
    }
  }

  const onEmailInputChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value)
    },
    [setEmail]
  )

  if (sub == null) {
    return (
      <div>
        <SectionIntroduction>
          <p>You need to have a valid subscription to perform this action.</p>
          <SectionFlexDualButtons>
            <CustomButton
              onClick={onCancel}
              variant='secondary'
              disabled={sending}
            >
              Cancel
            </CustomButton>
          </SectionFlexDualButtons>
        </SectionIntroduction>
      </div>
    )
  }

  return (
    <div>
      <SectionIntroduction>
        <p>Update your billing email</p>
        <SectionFlexRow>
          <label>Current Email</label>
          <span className='value'>{sub.email}</span>
        </SectionFlexRow>

        <StyledBillingInput
          style={{ marginTop: 0 }}
          placeholder='Billing Email'
          value={email}
          onChange={onEmailInputChangeHandler}
        />

        <SectionFlexDualButtons>
          <CustomButton
            onClick={onCancel}
            variant='secondary'
            disabled={sending}
          >
            Cancel
          </CustomButton>

          <CustomButton onClick={onSubmit} variant='primary' disabled={sending}>
            {sending ? <Spinner /> : 'Update'}
          </CustomButton>
        </SectionFlexDualButtons>
      </SectionIntroduction>
    </div>
  )
}

export default UpdateBillingEmailForm

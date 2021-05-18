import React, { useState, useCallback } from 'react'
import {
  SectionIntroduction,
  SectionFlexRow,
} from '../../organisms/settings/styled'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { StyledBillingInput } from '.'
import { updateSubEmail } from '../../../api/teams/subscription/update'
import { useToast } from '../../../../shared/lib/stores/toast'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../shared/components/atoms/ButtonGroup'

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
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            Cancel
          </Button>
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

        <ButtonGroup display='flex' layout='spread' justifyContent='flex-end'>
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            Cancel
          </Button>

          <LoadingButton
            onClick={onSubmit}
            variant='primary'
            disabled={sending}
            spinning={sending}
          >
            Update
          </LoadingButton>
        </ButtonGroup>
      </SectionIntroduction>
    </div>
  )
}

export default UpdateBillingEmailForm

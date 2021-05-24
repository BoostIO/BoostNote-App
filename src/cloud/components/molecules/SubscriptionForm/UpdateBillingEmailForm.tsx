import React, { useState, useCallback } from 'react'
import {
  SectionIntroduction,
  SectionFlexRow,
} from '../../organisms/settings/styled'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { updateSubEmail } from '../../../api/teams/subscription/update'
import { useToast } from '../../../../shared/lib/stores/toast'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../shared/components/atoms/ButtonGroup'
import FormRow from '../../../../shared/components/molecules/Form/templates/FormRow'
import Form from '../../../../shared/components/molecules/Form'
import styled from '../../../../shared/lib/styled'

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
    <Container>
      <p>Update your billing email</p>
      <SectionFlexRow>
        <label>Current Email</label>
        <span className='value'>{sub.email}</span>
      </SectionFlexRow>

      <Form onSubmit={onSubmit} rows={[]}>
        <FormRow
          row={{
            items: [
              {
                type: 'input',
                props: {
                  placeholder: 'Billing Email',
                  value: email,
                  onChange: onEmailInputChangeHandler,
                },
              },
            ],
          }}
        />
        <ButtonGroup display='flex' layout='spread' className='button__group'>
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            Cancel
          </Button>

          <LoadingButton
            type='submit'
            variant='primary'
            disabled={sending}
            spinning={sending}
          >
            Update
          </LoadingButton>
        </ButtonGroup>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  .button__group {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default UpdateBillingEmailForm

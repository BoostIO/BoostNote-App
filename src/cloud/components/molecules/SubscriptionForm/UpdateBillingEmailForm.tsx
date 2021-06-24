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
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'

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
  const { translate } = useI18n()

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
      <p>{translate(lngKeys.BillingUpdateEmail)}</p>
      <SectionFlexRow>
        <label>{translate(lngKeys.BillingCurrentEmail)}</label>
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
            {translate(lngKeys.GeneralCancel)}
          </Button>

          <LoadingButton
            type='submit'
            variant='primary'
            disabled={sending}
            spinning={sending}
          >
            {translate(lngKeys.GeneralUpdateVerb)}
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

import React, { useState, useCallback } from 'react'
import { SectionIntroduction } from '../../organisms/settings/styled'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { redeemPromo } from '../../../api/teams/subscription'
import { useToast } from '../../../../shared/lib/stores/toast'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../shared/components/atoms/ButtonGroup'
import Form from '../../../../shared/components/molecules/Form'
import FormRow from '../../../../shared/components/molecules/Form/templates/FormRow'
import styled from '../../../../shared/lib/styled'

interface UpdateBillingPromoFormProps {
  sub?: SerializedSubscription
  onSuccess: () => void
  onCancel: () => void
}

const UpdateBillingPromoForm = ({
  sub,
  onSuccess,
  onCancel,
}: UpdateBillingPromoFormProps) => {
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const [promoCode, setPromoCode] = useState<string>('')

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (sub == null || sub.status === 'canceled') {
      return
    }

    try {
      setSending(true)
      await redeemPromo(sub.teamId, { code: promoCode })
      pushMessage({
        title: 'Promo Code',
        description: `Applied promo code '${promoCode}' to your subscription`,
        type: 'success',
      })
      onSuccess()
    } catch (error) {
      if (error.response.status === 403) {
        pushMessage({
          type: 'error',
          title: 'Error',
          description: `Promo code ${promoCode} is not available for this account`,
        })
      } else {
        pushApiErrorMessage(error)
      }
    } finally {
      setSending(false)
      setPromoCode('')
    }
  }

  const onPromoInputChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPromoCode(event.target.value)
    },
    [setPromoCode]
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
      <p>Apply a promotion code</p>
      <Form onSubmit={onSubmit} rows={[]}>
        <FormRow
          row={{
            fullWidth: true,
            items: [
              {
                type: 'input',
                props: {
                  placeholder: 'Promo Code',
                  value: promoCode,
                  onChange: onPromoInputChangeHandler,
                },
              },
            ],
          }}
        />

        <ButtonGroup
          display='flex'
          layout='spread'
          justifyContent='flex-end'
          className='button__group'
        >
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            Cancel
          </Button>

          <LoadingButton
            onClick={onSubmit}
            variant='primary'
            disabled={sending}
            spinning={sending}
          >
            Apply
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

export default UpdateBillingPromoForm

import React, { useState, useCallback } from 'react'
import { SectionIntroduction } from '../../organisms/settings/styled'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { StyledBillingInput } from '.'
import { redeemPromo } from '../../../api/teams/subscription'
import { useToast } from '../../../../shared/lib/stores/toast'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../shared/components/atoms/ButtonGroup'

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
    <div>
      <SectionIntroduction>
        <p>Apply a promotion code</p>
        <StyledBillingInput
          style={{ marginTop: 0 }}
          placeholder='Promo Code'
          value={promoCode}
          onChange={onPromoInputChangeHandler}
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
            Apply
          </LoadingButton>
        </ButtonGroup>
      </SectionIntroduction>
    </div>
  )
}

export default UpdateBillingPromoForm

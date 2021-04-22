import React, { useState, useCallback } from 'react'
import {
  SectionIntroduction,
  SectionFlexDualButtons,
} from '../../organisms/settings/styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { StyledBillingInput } from '.'
import { Spinner } from '../../atoms/Spinner'
import { redeemPromo } from '../../../api/teams/subscription'
import { useToast } from '../../../../shared/lib/stores/toast'

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
        <p>Apply a promotion code</p>
        <StyledBillingInput
          style={{ marginTop: 0 }}
          placeholder='Promo Code'
          value={promoCode}
          onChange={onPromoInputChangeHandler}
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
            {sending ? <Spinner /> : 'Apply'}
          </CustomButton>
        </SectionFlexDualButtons>
      </SectionIntroduction>
    </div>
  )
}

export default UpdateBillingPromoForm

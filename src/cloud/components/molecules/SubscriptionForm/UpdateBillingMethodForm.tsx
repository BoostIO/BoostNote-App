import React, { useState, useMemo } from 'react'
import {
  SectionIntroduction,
  SectionFlexRow,
  SectionFlexDualButtons,
} from '../../organisms/settings/styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { Spinner } from '../../atoms/Spinner'
import { useToast } from '../../../lib/stores/toast'
import { updateSubMethod } from '../../../api/teams/subscription/update'
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js'
import { StripeElementStyle } from '@stripe/stripe-js'
import { selectTheme } from '../../../lib/styled'
import { useSettings } from '../../../lib/stores/settings'
import { StyledCardElementContainer } from './index'

interface UpdateBillingMethodFormProps {
  sub?: SerializedSubscription
  onSuccess: (subscription: SerializedSubscription) => void
  onCancel: () => void
}

const UpdateBillingMethodForm = ({
  sub,
  onSuccess,
  onCancel,
}: UpdateBillingMethodFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const { pushApiErrorMessage: pushAxiosErrorMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const { settings } = useSettings()

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (sub == null) {
      return
    }
    if (!stripe || !elements) {
      return
    }
    const card = elements.getElement(CardElement)

    setSending(true)
    if (card == null) {
      return setSending(false)
    }

    const { error, source } = await stripe.createSource(card, { type: 'card' })
    if (error != null || source == null) {
      return setSending(false)
    }

    try {
      setSending(true)
      const { subscription } = await updateSubMethod(sub.teamId, {
        source: source.id,
      })
      onSuccess(subscription)
    } catch (error) {
      pushAxiosErrorMessage(error)
      setSending(false)
    }
  }

  const stripeFormStyle: StripeElementStyle = useMemo(() => {
    const theme = selectTheme(settings['general.theme'])
    return {
      base: {
        color: theme.emphasizedTextColor,
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSizes.default}px`,
        '::placeholder': {
          color: theme.subtleTextColor,
        },
      },
    }
  }, [settings])

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
        <p>Update your Credit Card</p>
        <SectionFlexRow>
          <label>Current Credit Card</label>
          <span className='value'>**** **** **** {sub.last4}</span>
        </SectionFlexRow>

        <StyledCardElementContainer>
          <CardElement
            options={{
              style: stripeFormStyle,
            }}
          />
        </StyledCardElementContainer>

        <SectionFlexDualButtons className='marginTop'>
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

export default UpdateBillingMethodForm

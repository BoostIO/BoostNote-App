import React, { useState, useMemo, useCallback } from 'react'
import {
  SectionIntroduction,
  SectionFlexRow,
} from '../../organisms/settings/styled'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { updateSubMethod } from '../../../api/teams/subscription/update'
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js'
import { StripeCardElementChangeEvent } from '@stripe/stripe-js'
import { useSettings } from '../../../lib/stores/settings'
import Alert from '../../../../components/atoms/Alert'
import { useToast } from '../../../../shared/lib/stores/toast'
import ButtonGroup from '../../../../shared/components/atoms/ButtonGroup'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import FormStripeInput from '../../../../shared/components/molecules/Form/atoms/FormStripeInput'
import FormRow from '../../../../shared/components/molecules/Form/templates/FormRow'
import Form from '../../../../shared/components/molecules/Form'
import styled from '../../../../shared/lib/styled'

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
  const { pushApiErrorMessage } = useToast()
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
      pushApiErrorMessage(error)
      setSending(false)
    }
  }

  const currentCardBrand = sub?.cardBrand

  const [newCardBrand, setNewCardBrand] = useState('unknown')

  const handleCardElementChange = useCallback(
    (event: StripeCardElementChangeEvent) => {
      setNewCardBrand(event.brand)
    },
    []
  )

  const usingDifferentCurrencyPricing = useMemo(() => {
    if (newCardBrand.toLowerCase() === 'unknown') {
      return false
    }
    const differentCardBrand =
      newCardBrand.toLowerCase() !== (currentCardBrand || '').toLowerCase()

    const oneOfThemAreJcb =
      newCardBrand === 'jcb' || (currentCardBrand || '').toLowerCase() === 'jcb'
    if (differentCardBrand && oneOfThemAreJcb) {
      return true
    } else {
      return false
    }
  }, [currentCardBrand, newCardBrand])

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
      <SectionIntroduction>
        <p>Update your Credit Card</p>
        <SectionFlexRow>
          <label>Current Credit Card</label>
          <span className='value'>
            **** **** **** {sub.last4}
            {sub.cardBrand != null && ` (${sub.cardBrand})`}
          </span>
        </SectionFlexRow>
        {usingDifferentCurrencyPricing && (
          <Alert variant='danger'>
            Switching payment method from/to JCB card requires canceling
            existing active subscription. Please cancel the existing one and
            subscribe again with a new card.
          </Alert>
        )}

        <Form rows={[]} onSubmit={onSubmit}>
          <FormRow>
            <FormStripeInput
              className='form__row__item'
              theme={settings['general.theme']}
              onChange={handleCardElementChange}
            />
          </FormRow>

          <ButtonGroup display='flex' layout='spread' className='button__group'>
            <Button onClick={onCancel} variant='secondary' disabled={sending}>
              Cancel
            </Button>

            <LoadingButton
              type='submit'
              variant='primary'
              disabled={usingDifferentCurrencyPricing || sending}
              spinning={sending}
            >
              Update
            </LoadingButton>
          </ButtonGroup>
        </Form>
      </SectionIntroduction>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  .button__group {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default UpdateBillingMethodForm

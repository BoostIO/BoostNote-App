import React, { useState, FormEvent, useCallback, useMemo } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { createSubscription } from '../../api/teams/subscription'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import Stripe from '@stripe/stripe-js'
import { useSettings } from '../../lib/stores/settings'
import { usePage } from '../../lib/stores/pageStore'
import {
  discountPlans,
  SubscriptionPeriod,
  UpgradePlans,
} from '../../lib/stripe'
import Alert from '../../../components/atoms/Alert'
import { useToast } from '../../../design/lib/stores/toast'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import ButtonGroup from '../../../design/components/atoms/ButtonGroup'
import SubscriptionCostSummary from '../Subscription/SubscriptionCostSummary'
import { isTimeEligibleForDiscount } from '../../lib/subscription'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import Form from '../../../design/components/molecules/Form'
import styled from '../../../design/lib/styled'
import FormStripeInput from '../../../design/components/molecules/Form/atoms/FormStripeInput'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import Banner from '../../../design/components/atoms/Banner'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

interface SubscriptionFormProps {
  team: SerializedTeam
  initialPlan?: UpgradePlans
  period: SubscriptionPeriod
  ongoingTrial?: boolean
  onSuccess: (subscription: SerializedSubscription) => void
  onCancel?: () => void
}

export const maxSeats = 99

const SubscriptionForm = ({
  team,
  ongoingTrial,
  initialPlan,
  period,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [showPromoCode, setShowPromoCode] = useState(false)
  const [sending, setSending] = useState(false)
  const { settings } = useSettings()
  const { permissions = [] } = usePage()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [currentPlan] = useState<UpgradePlans>(
    initialPlan != null ? initialPlan : 'standard'
  )
  const { translate } = useI18n()

  const onEmailInputChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value)
    },
    [setEmail]
  )

  const onPromoCodeInputChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPromoCode(event.target.value)
    },
    []
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)

    if (!stripe || !elements || currentPlan == null) {
      return setSending(false)
    }
    const card = elements.getElement(CardElement)

    if (card == null) {
      return setSending(false)
    }

    const { error, source } = await stripe.createSource(card, { type: 'card' })
    if (error != null || source == null) {
      pushMessage({
        type: 'error',
        title: '400',
        description: error?.message || 'Source could not be fetched',
      })
      return setSending(false)
    }

    try {
      const result = await createSubscription(team, {
        source: source.id,
        email,
        code: showPromoCode && promoCode.length > 0 ? promoCode : undefined,
        plan: currentPlan,
        period,
      })

      if (result.requiresAction) {
        const { error } = await stripe.confirmCardPayment(result.clientSecret)
        if (error) {
          pushMessage({
            type: 'info',
            title: 'Pending',
            description:
              error.message ||
              'Your subscription is pending and needs further action.',
          })
        } else {
          result.subscription.status = 'active'
        }
      }
      setSending(false)
      onSuccess(result.subscription)
    } catch (error) {
      pushApiErrorMessage(error)
      setSending(false)
    }
  }

  const [newCardBrand, setNewCardBrand] = useState('unknown')

  const handleCardElementChange = useCallback(
    (event: Stripe.StripeCardElementChangeEvent) => {
      setNewCardBrand(event.brand)
    },
    []
  )

  const usingJpyPricing = useMemo(() => {
    return newCardBrand.toLowerCase() === 'jcb'
  }, [newCardBrand])

  const numberOfMembers = useMemo(() => {
    return permissions.filter((p) => p.role !== 'viewer').length
  }, [permissions])

  const eligibleDiscount = useMemo(() => {
    return isTimeEligibleForDiscount(team) && period === 'yearly'
      ? discountPlans.newSpaceAnnual
      : undefined
  }, [team, period])

  return (
    <Container>
      <Form rows={[]} onSubmit={handleSubmit}>
        <SubscriptionCostSummary
          usingJpyPricing={usingJpyPricing}
          plan={currentPlan}
          period={period}
          seats={numberOfMembers}
          discount={eligibleDiscount}
        />
        {usingJpyPricing && (
          <Alert variant='secondary'>
            {translate(lngKeys.PaymentMethodJpy)}
          </Alert>
        )}
        <StyledPaymentHeader>
          {translate(lngKeys.PaymentMethod)}
        </StyledPaymentHeader>
        <FormRow>
          <FormStripeInput
            theme={settings['general.theme']}
            className='form__row__item'
            onChange={handleCardElementChange}
          />
        </FormRow>
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
        <FormRow
          row={{
            title: ongoingTrial
              ? translate(lngKeys.TrialWillBeStopped)
              : undefined,
          }}
        >
          <Button
            variant='link'
            className='sub__coupon'
            iconPath={showPromoCode ? mdiChevronDown : mdiChevronRight}
            onClick={() => {
              setShowPromoCode((prev) => !prev)
            }}
            disabled={sending}
          >
            {translate(lngKeys.ApplyCoupon)}
          </Button>
        </FormRow>

        {showPromoCode && (
          <>
            {isTimeEligibleForDiscount(team) && (
              <Banner variant='warning'>
                {translate(lngKeys.PlanDiscountCouponWarning)}
              </Banner>
            )}
            <FormRow
              row={{
                items: [
                  {
                    type: 'input',
                    props: {
                      placeholder: translate(lngKeys.PromoCode),
                      value: promoCode,
                      onChange: onPromoCodeInputChangeHandler,
                    },
                  },
                ],
              }}
            />
          </>
        )}
        <ButtonGroup layout='spread' className='button__group' display='flex'>
          {onCancel != null && (
            <Button
              type='button'
              disabled={sending}
              onClick={onCancel}
              variant='secondary'
            >
              {translate(lngKeys.GeneralCancel)}
            </Button>
          )}
          <LoadingButton
            type='submit'
            disabled={!stripe || sending || currentPlan == null}
            spinning={sending}
          >
            {translate(lngKeys.Subscribe)}
          </LoadingButton>
        </ButtonGroup>
      </Form>
    </Container>
  )
}

export default SubscriptionForm

export const StyledPaymentHeader = styled.h3`
  margin: ${({ theme }) => theme.sizes.spaces.l}px 0
    ${({ theme }) => theme.sizes.spaces.df}px;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
`

export const Container = styled.div`
  .button__group {
    margin-top: 40px;
  }
`

import React, { useState, FormEvent, useCallback, useMemo } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { createSubscription } from '../../../api/teams/subscription'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import {
  SectionPrimaryButton,
  SectionFlexDualButtons,
  SectionDescription,
  SectionSecondaryButton,
  SectionParagraph,
} from '../../organisms/settings/styled'
import { inputStyle } from '../../../lib/styled/styleFunctions'
import styled from '../../../lib/styled'
import { StripeElementStyle } from '@stripe/stripe-js'
import { useSettings } from '../../../lib/stores/settings'
import { selectTheme } from '../../../lib/styled'
import { Spinner } from '../../atoms/Spinner'
import { usePage } from '../../../lib/stores/pageStore'
import { useToast } from '../../../lib/stores/toast'
import {
  stripeProPlanUnit,
  stripeStandardPlanUnit,
  UpgradePlans,
} from '../../../lib/stripe'
import plur from 'plur'
import Icon from '../../../../components/atoms/Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'

interface SubscriptionFormProps {
  team: SerializedTeam
  initialPlan?: UpgradePlans
  ongoingTrial?: boolean
  onError: (err: any) => void
  onSuccess: (subscription: SerializedSubscription) => void
  onCancel?: () => void
}

export const maxSeats = 99

const SubscriptionForm = ({
  team,
  ongoingTrial,
  initialPlan,
  onError,
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
  const { pushApiErrorMessage } = useToast()
  const [currentPlan] = useState<UpgradePlans>(
    initialPlan != null ? initialPlan : 'standard'
  )

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
      return setSending(false)
    }

    try {
      const {
        requiresAction,
        clientSecret,
        subscription,
      } = await createSubscription(team, {
        source: source.id,
        email,
        code: showPromoCode && promoCode.length > 0 ? promoCode : undefined,
        plan: currentPlan,
      })

      if (requiresAction) {
        const { error } = await stripe.confirmCardPayment(clientSecret)
        if (error) {
          onError(error)
          return setSending(false)
        }
      }
      setSending(false)
      onSuccess(subscription)
    } catch (error) {
      pushApiErrorMessage(error)
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

  const planDescription: {
    heading: React.ReactNode
  } = useMemo(() => {
    switch (currentPlan) {
      case 'pro':
        return {
          heading: (
            <SectionParagraph>
              <StyledUpgradePlan>
                <StyledCalcuration>
                  <span className='plan-name'>Pro</span> ${stripeProPlanUnit}{' '}
                  &times; {permissions.length}{' '}
                  {plur('member', permissions.length)} &times; 1 month
                </StyledCalcuration>
              </StyledUpgradePlan>
              <StyledTotal>
                <label>Total Monthly Price</label>
                <strong>${permissions.length * stripeProPlanUnit}</strong>
              </StyledTotal>
            </SectionParagraph>
          ),
        }
      case 'standard':
        return {
          heading: (
            <SectionParagraph>
              <StyledUpgradePlan>
                <StyledCalcuration>
                  <span className='plan-name'>Standard</span> $
                  {stripeStandardPlanUnit} &times; {permissions.length}{' '}
                  {plur('member', permissions.length)} &times; 1 month
                </StyledCalcuration>
              </StyledUpgradePlan>
              <StyledTotal>
                <label>Total Monthly Price</label>
                <strong>${permissions.length * stripeStandardPlanUnit}</strong>
              </StyledTotal>
            </SectionParagraph>
          ),
        }
      default:
        return { heading: null, footing: null }
    }
  }, [currentPlan, permissions.length])

  return (
    <StyledSubscriptionForm onSubmit={handleSubmit}>
      {planDescription.heading}
      <StyledPaymentHeader>Payment Method</StyledPaymentHeader>
      <StyledCardElementContainer>
        <CardElement
          options={{
            style: stripeFormStyle,
          }}
        />
      </StyledCardElementContainer>
      <StyledBillingInput
        placeholder='Billing Email'
        value={email}
        onChange={onEmailInputChangeHandler}
      />
      {ongoingTrial != null && (
        <SectionDescription>
          Your free trial will be stopped.
        </SectionDescription>
      )}
      <button
        className='sub__coupon'
        onClick={() => {
          setShowPromoCode((prev) => !prev)
        }}
        disabled={sending}
      >
        <Icon path={showPromoCode ? mdiChevronDown : mdiChevronRight} />
        Apply a coupon
      </button>
      {showPromoCode && (
        <StyledBillingInput
          style={{ marginTop: '0' }}
          placeholder='Promo Code'
          value={promoCode}
          onChange={onPromoCodeInputChangeHandler}
        />
      )}
      <SectionFlexDualButtons
        style={{ justifyContent: 'flex-start', marginTop: '40px' }}
      >
        {onCancel != null && (
          <SectionSecondaryButton
            type='button'
            disabled={sending}
            onClick={onCancel}
            style={{ marginLeft: 0 }}
          >
            Cancel
          </SectionSecondaryButton>
        )}
        <SectionPrimaryButton
          type='submit'
          disabled={!stripe || sending || currentPlan == null}
        >
          {sending ? <Spinner /> : 'Subscribe'}
        </SectionPrimaryButton>
      </SectionFlexDualButtons>
    </StyledSubscriptionForm>
  )
}

export default SubscriptionForm

export const StyledUpgradePlan = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.small}px 0;
  border: dashed ${({ theme }) => theme.subtleBorderColor};
  border-width: 1px 0;
`

export const StyledCalcuration = styled.div`
  .plan-name {
    display: inline-block;
    margin-right: ${({ theme }) => theme.space.xsmall}px;
    padding: 2px ${({ theme }) => theme.space.xxsmall}px;
    background-color: ${({ theme }) => theme.infoBackgroundColor};
    border-radius: 3px;
    color: ${({ theme }) => theme.whiteTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  }
`

export const StyledPaymentHeader = styled.h3`
  margin: ${({ theme }) => theme.space.large}px 0
    ${({ theme }) => theme.space.default}px;
  font-size: ${({ theme }) => theme.fontSizes.medium}px;
`

export const StyledTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.small}px 0;
  border-bottom: 2px solid ${({ theme }) => theme.subtleBorderColor};
  font-size: ${({ theme }) => theme.fontSizes.large}px;

  label {
    margin: 0;
    font-weight: bold;
  }
`

export const StyledBillingInput = styled.input`
  ${inputStyle}
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
  height: 40px;
  margin: ${({ theme }) => theme.space.default}px 0;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
`

export const StyledBillingSeatsInput = styled.input`
  ${inputStyle}
  flex-grow: 0;
  flex-shrink: 0;
  text-align: right;
  width: 100px;
  height: 40px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
`

export const StyledSubscriptionForm = styled.form`
  width: 540px;
  margin-top: ${({ theme }) => theme.space.default}px;

  .btn-primary,
  .btn-secondary {
    margin-bottom: ${({ theme }) => theme.space.default}px;
  }

  .StripeElement {
    margin-top: 2px;
  }

  .sub__coupon {
    display: inline-flex;
    align-items: center;
    transition: 200ms color;
    background: none;
    border: none;
    outline: none;
    padding: 0;
    color: ${({ theme }) => theme.primaryTextColor};
    margin-bottom: ${({ theme }) => theme.space.xxsmall}px;

    &:hover,
    &:focus,
    &:active {
      text-decoration: underline;
    }

    svg {
      margin-left: ${({ theme }) => theme.space.xxsmall}px;
    }
  }
`

export const StyledCardElementContainer = styled.div`
  ${inputStyle}
  height: 40px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
`

import React, { useMemo } from 'react'
import styled from '../../../../shared/lib/styled'
import cc from 'classcat'
import { AppComponent } from '../../../../shared/lib/types'
import plur from 'plur'
import {
  stripeProJpyPlanUnit,
  stripeProPlanUnit,
  stripeStandardJpyPlanUnit,
  stripeStandardPlanUnit,
  UpgradePlans,
  newUserDiscountPlans,
} from '../../../lib/stripe'
import Icon from '../../../../shared/components/atoms/Icon'
import { mdiGiftOutline } from '@mdi/js'

interface SubscriptionCostSummaryProps {
  plan: UpgradePlans
  seats: number
  usingJpyPricing: boolean
  discounted?: boolean
}

const SubscriptionCostSummary: AppComponent<SubscriptionCostSummaryProps> = ({
  plan,
  seats,
  discounted,
  usingJpyPricing,
  children,
  className,
}) => {
  const currencyMarker = usingJpyPricing ? '¥' : '$'
  const discount = discounted
    ? plan === 'pro'
      ? newUserDiscountPlans.pro
      : newUserDiscountPlans.standard
    : undefined

  const pricePerUnit = useMemo(() => {
    switch (plan) {
      case 'pro':
        return usingJpyPricing ? stripeProJpyPlanUnit : stripeProPlanUnit
      case 'standard':
      default:
        return usingJpyPricing
          ? stripeStandardJpyPlanUnit
          : stripeStandardPlanUnit
    }
  }, [plan, usingJpyPricing])

  const discountedPricePerUnit = useMemo(() => {
    if (discount == null) {
      return 0
    }

    if (!usingJpyPricing) {
      return discount.amountOff
    }

    return discount.amountOff * 100
  }, [discount, usingJpyPricing])

  return (
    <Container className={cc(['subscription__cost__summary', className])}>
      <div className='subscription__cost__summary__row'>
        <div className='subscription__cost__summary__row__description'>
          <span className='subscription__cost__summary__plan'>{plan}</span>
          {currencyMarker}
          {pricePerUnit} &times; {seats} {plur('member', seats)} &times; 1 month
        </div>
        <div className='subscription__cost__summary__row__calcuration'>
          {currencyMarker}
          {pricePerUnit * seats}
        </div>
      </div>
      {discount != null && (
        <div className='subscription__cost__summary__row'>
          <div className='subscription__cost__summary__row__description'>
            <Icon
              path={mdiGiftOutline}
              size={16}
              className='subscription__cost__summary__discount__icon'
            />
            {discount.durationInMonths}{' '}
            {plur('month', discount.durationInMonths)} discount
          </div>
          <div className='subscription__cost__summary__row__calcuration'>
            -{discount.percentageOff}%
          </div>
        </div>
      )}
      <div className='subscription__cost__summary__row--total'>
        <strong className='subscription__cost__summary__row__description'>
          Total Monthly Price
        </strong>
        <strong className='subscription__cost__summary__row__calcuration'>
          {currencyMarker}
          {pricePerUnit * seats - discountedPricePerUnit * seats}
        </strong>
      </div>
      {children}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;

  .subscription__cost__summary__discount__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .subscription__cost__summary__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    border-top: 1px solid transparent;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .subscription__cost__summary__row + .subscription__cost__summary__row {
    border-top: 1px dashed ${({ theme }) => theme.colors.border.main};
  }

  .subscription__cost__summary__row__description {
    display: flex;
    align-items: center;
  }

  .subscription__cost__summary__plan {
    display: inline-block;
    text-transform: capitalize;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    padding: 2px ${({ theme }) => theme.sizes.spaces.xsm}px;
    background-color: ${({ theme }) => theme.colors.variants.info.base};
    border-radius: 3px;
    color: ${({ theme }) => theme.colors.variants.info.text};
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
  }

  .subscription__cost__summary__row--total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border.main};
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }
`

export default SubscriptionCostSummary

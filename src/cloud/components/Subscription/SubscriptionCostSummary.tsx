import React, { useMemo } from 'react'
import styled from '../../../design/lib/styled'
import cc from 'classcat'
import { AppComponent } from '../../../design/lib/types'
import plur from 'plur'
import {
  stripeProJpyPlanUnit,
  stripeProPlanUnit,
  stripeStandardJpyPlanUnit,
  stripeStandardPlanUnit,
  UpgradePlans,
  CloudDiscountParameters,
  SubscriptionPeriod,
  stripeAnnualProJpyPlanUnit,
  stripeAnnualProPlanUnit,
  stripeAnnualStandardPlanUnit,
  stripeAnnualJpyStandardPlanUnit,
} from '../../lib/stripe'
import Icon from '../../../design/components/atoms/Icon'
import { mdiGiftOutline } from '@mdi/js'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { lowerCase } from 'lodash'

interface SubscriptionCostSummaryProps {
  plan: UpgradePlans
  period: SubscriptionPeriod
  seats: number
  usingJpyPricing: boolean
  discount?: CloudDiscountParameters
}

const SubscriptionCostSummary: AppComponent<SubscriptionCostSummaryProps> = ({
  plan,
  period,
  seats,
  discount,
  usingJpyPricing,
  children,
  className,
}) => {
  const { translate } = useI18n()
  const currencyMarker = usingJpyPricing ? '¥' : '$'

  const pricePerUnit = useMemo(() => {
    const isYearly = period === 'yearly'
    switch (plan) {
      case 'pro':
        return isYearly
          ? usingJpyPricing
            ? stripeAnnualProJpyPlanUnit
            : stripeAnnualProPlanUnit
          : usingJpyPricing
          ? stripeProJpyPlanUnit
          : stripeProPlanUnit
      case 'standard':
      default:
        return isYearly
          ? usingJpyPricing
            ? stripeAnnualJpyStandardPlanUnit
            : stripeAnnualStandardPlanUnit
          : usingJpyPricing
          ? stripeStandardJpyPlanUnit
          : stripeStandardPlanUnit
    }
  }, [plan, usingJpyPricing, period])

  return (
    <Container className={cc(['subscription__cost__summary', className])}>
      <div className='subscription__cost__summary__row'>
        <div className='subscription__cost__summary__row__description'>
          <span className='subscription__cost__summary__plan'>{plan}</span>
          {currencyMarker}
          {pricePerUnit} &times; {seats}{' '}
          {lowerCase(translate(lngKeys.GeneralMembers))} &times;{' '}
          {period === 'yearly' ? `12 months` : `1 month`}
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

      <div className='subscription__cost__summary__row'>
        <div className='subscription__cost__summary__row__description'>
          {translate(lngKeys.UnlimitedViewers)}
          <div className='context__tooltip'>
            <div className='context__tooltip__text'>
              {translate(lngKeys.RoleViewerDescription)}
            </div>
            ?
          </div>
        </div>
        <div className='subscription__cost__summary__row__calcuration'>$0</div>
      </div>
      <div className='subscription__cost__summary__row--total'>
        <strong className='subscription__cost__summary__row__description'>
          Total {period === 'yearly' ? 'Yearly' : 'Monthly'} Price
        </strong>
        <strong className='subscription__cost__summary__row__calcuration'>
          {currencyMarker}
          {Math.round(
            (pricePerUnit * seats -
              pricePerUnit *
                seats *
                (discount == null ? 0 : discount.percentageOff / 100)) *
              (period === 'monthly' ? 1 : 12)
          )}
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

  .context__tooltip {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    width: 20px;
    height: 20px;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    position: relative;

    .context__tooltip__text {
      display: none;
      border-radius: 3px;
      position: absolute;
      bottom: 120%;
      color: ${({ theme }) => theme.colors.text.secondary};
      background: ${({ theme }) => theme.colors.background.tertiary};
      width: 300px;
      padding: ${({ theme }) => theme.sizes.spaces.sm}px
        ${({ theme }) => theme.sizes.spaces.df}px;
      left: 50%;
      transform: translateX(-50%);
      line-height: ${({ theme }) => theme.sizes.fonts.md}px;
    }
    &:hover {
      .context__tooltip__text {
        display: block;
      }
    }
  }

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

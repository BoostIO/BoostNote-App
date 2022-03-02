import { capitalize } from 'lodash'
import React, { useMemo } from 'react'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import {
  discountPlans,
  stripeAnnualProPlanUnit,
  stripeAnnualStandardPlanUnit,
  stripeProPlanUnit,
  stripeStandardPlanUnit,
  SubscriptionPeriod,
  UpgradePlans,
} from '../../lib/stripe'
import cc from 'classcat'
import { lngKeys } from '../../lib/i18n/types'
import plur from 'plur'

interface SubscriptionPlanHeaderProps {
  discounted?: boolean
  plan: UpgradePlans | 'free'
  period: SubscriptionPeriod
  showYearlyPrices?: boolean
}

const SubscriptionPlanHeader = ({
  plan,
  discounted,
  period,
  showYearlyPrices,
}: SubscriptionPlanHeaderProps) => {
  const { translate } = useI18n()

  const planContent = useMemo(() => {
    let price = 0
    let discount
    let discountedPrice
    const isYearly = period === 'yearly'
    let description = `${translate(lngKeys.PlanPerMember)} ${translate(
      lngKeys.PlanPerMonth
    )}`

    switch (plan) {
      case 'pro':
        price = isYearly
          ? showYearlyPrices
            ? stripeAnnualProPlanUnit * 12
            : stripeAnnualProPlanUnit
          : stripeProPlanUnit
        break
      case 'standard':
        price = isYearly
          ? showYearlyPrices
            ? stripeAnnualStandardPlanUnit * 12
            : stripeAnnualStandardPlanUnit
          : stripeStandardPlanUnit
        break
      default:
        break
    }

    if (discounted && plan !== 'free') {
      discount = isYearly
        ? discountPlans.newSpaceAnnual
        : discountPlans.newSpace

      discountedPrice = Math.round(
        price -
          (price *
            (isYearly
              ? discountPlans.newSpaceAnnual.percentageOff
              : discountPlans.newSpace.percentageOff)) /
            100
      )
    }

    if (period === 'yearly' && showYearlyPrices) {
      description = `${translate(lngKeys.PlanPerMember)} ${translate(
        lngKeys.PlanPerYear
      )}`
    }

    return {
      title: capitalize(plan),
      price,
      discountedPrice,
      discount,
      description,
    }
  }, [plan, discounted, period, showYearlyPrices, translate])

  return (
    <Container className='plan__item__header'>
      <label className='plan__item__title'>{planContent.title}</label>
      <div
        className={cc([
          'plan__item__price',
          discounted && plan !== 'free' && 'plan__item__price--discounted',
        ])}
      >
        <span className='plan__item__price__default'>${planContent.price}</span>
        {planContent.discountedPrice != null && (
          <span className='plan__item__price__discount'>
            ${planContent.discountedPrice}
          </span>
        )}
        <div className='plan__item__price__description'>
          {planContent.description}
        </div>
      </div>
      {discounted && (
        <div className='plan__item__discount'>
          {planContent.discount != null && (
            <>
              {planContent.discount.percentageOff}% OFF for{' '}
              {planContent.discount.durationInMonths === 12
                ? '1 year'
                : `${
                    planContent.discount.durationInMonths === 12
                      ? '1'
                      : planContent.discount.durationInMonths
                  } ${plur('month', planContent.discount.durationInMonths)}`}
            </>
          )}
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  .plan__item__price {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    justify-content: flex-start;

    &.plan__item__price--discounted {
      .plan__item__price__default::after,
      .plan__item__price__default::before {
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${({ theme }) => theme.colors.text.primary};
      }

      .plan__item__price__default::after {
        bottom: 35%;
      }
      .plan__item__price__default::before {
        top: 35%;
      }
    }

    .plan__item__price__default,
    .plan__item__price__discount {
      position: relative;
      font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .plan__item__price__discount {
      color: ${({ theme }) => theme.colors.variants.warning.base};
    }

    .plan__item__price__description {
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      line-height: 1;
      opacity: 0.6;
      width: 70px;
      padding-top: 2px;
    }
  }

  .plan__item__title {
    display: block;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    font-weight: 600;
  }

  .plan__item__discount {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    color: ${({ theme }) => theme.colors.variants.warning.base};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .plan__item__discount {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    color: ${({ theme }) => theme.colors.variants.warning.base};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    height: ${({ theme }) => theme.sizes.fonts.md}px;
  }
`

export default SubscriptionPlanHeader

import { formatDistanceToNow } from 'date-fns'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import { SerializedTeam } from '../../interfaces/db/team'
import {
  discountPlans,
  stripeProPlanUnit,
  stripeStandardPlanUnit,
  UpgradePlans,
} from '../../lib/stripe'
import {
  freePlanStorageMb,
  proPlanStorageMb,
  revisionHistoryStandardDays,
  standardPlanStorageMb,
} from '../../lib/subscription'
import cc from 'classcat'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

interface PlanTablesProps {
  team: SerializedTeam
  subscription?: SerializedSubscription
  selectedPlan: UpgradePlans | 'free'
  discounted?: boolean
  freePlanFooter?: React.ReactNode
  onFreeCallback?: () => void
  onStandardCallback?: () => void
  onProCallback?: () => void
  onTrialCallback?: () => void
}

const PlanTables = ({
  team,
  selectedPlan,
  onFreeCallback,
  onTrialCallback,
  onStandardCallback,
  onProCallback,
  subscription,
  discounted,
  freePlanFooter,
}: PlanTablesProps) => {
  const { translate } = useI18n()
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1080 })

  const freeTrialContent = useMemo(() => {
    if (subscription != null) {
      if (subscription.status !== 'trialing') {
        return null
      }

      const trialEndDate = new Date(subscription.currentPeriodEnd * 1000)
      return (
        <p>
          <span className='check'>&#x2713;</span>{' '}
          {translate(lngKeys.PlanInTrial, {
            remaining: formatDistanceToNow(trialEndDate, {
              includeSeconds: false,
            }),
          })}
        </p>
      )
    }

    if (!team.trial || onTrialCallback == null) {
      return null
    }

    return (
      <Button
        variant='link'
        className='free__trial__btn'
        onClick={(e: any) => {
          e.preventDefault()
          onTrialCallback()
        }}
      >
        {translate(lngKeys.PlanTrial, { days: 7 })}
      </Button>
    )
  }, [subscription, team, onTrialCallback, translate])

  return (
    <Container className={cc(['plans', isTabletOrMobile && 'plans--mobile'])}>
      <div className='plan__item plan__item--free'>
        <div className='plan__item__header'>
          <label className='plan__item__title'>Free</label>
          <div className='plan__item__price'>
            <span className='plan__item__price__default'>$0</span>
            <div className='plan__item__price__description'>
              {translate(lngKeys.PlanPerMember)}{' '}
              {translate(lngKeys.PlanPerMonth)}
            </div>
          </div>
        </div>
        <div className='plan__item__perks'>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanFreePerk1)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanFreePerk2)}</span>
          </div>

          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanFreePerk3)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>{freePlanStorageMb}MB</span>
          </div>
        </div>
        <div className='plan__item__footer'>
          {selectedPlan === 'free' ? (
            freePlanFooter != null ? (
              freePlanFooter
            ) : (
              <Button
                className='upgrade__btn'
                disabled={true}
                variant='secondary'
              >
                Current Plan
              </Button>
            )
          ) : (
            <Button onClick={onFreeCallback} className='upgrade__btn'>
              Downgrade
            </Button>
          )}
        </div>
      </div>
      <div className='plan__item plan__item--standard'>
        <div className='plan__item__header'>
          <label className='plan__item__title'>Standard</label>
          <div
            className={cc([
              'plan__item__price',
              discounted && 'plan__item__price--discounted',
            ])}
          >
            <span className='plan__item__price__default'>
              ${stripeStandardPlanUnit}
            </span>
            {discounted && (
              <span className='plan__item__price__discount'>
                $
                {Math.round(
                  stripeStandardPlanUnit -
                    stripeStandardPlanUnit *
                      (discountPlans.newSpace.percentageOff / 100)
                )}
              </span>
            )}
            <div className='plan__item__price__description'>
              {translate(lngKeys.PlanPerMember)}{' '}
              {translate(lngKeys.PlanPerMonth)}
            </div>
          </div>
        </div>
        {discounted && (
          <div className='plan__item__discount'>
            {translate(lngKeys.PlanDiscountDetail, {
              off: discountPlans.newSpace.percentageOff,
              month: discountPlans.newSpace.durationInMonths,
            })}
          </div>
        )}
        <div className='plan__item__perks'>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanStandardPerk1)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanStandardPerk2)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>
              {translate(lngKeys.PlanStandardPerk3, {
                days: revisionHistoryStandardDays,
              })}
            </span>
          </div>
          <div className='plan__item__perk'>
            <span>
              {translate(lngKeys.PlanStoragePerk, {
                storageSize: `${standardPlanStorageMb / 1000}GB`,
              })}
            </span>
          </div>
        </div>
        <div className='plan__item__footer'>
          {selectedPlan === 'standard' ? (
            <Button
              className='upgrade__btn'
              disabled={true}
              variant='secondary'
            >
              Current Plan
            </Button>
          ) : (
            <Button
              onClick={onStandardCallback}
              className='upgrade__btn'
              disabled={onStandardCallback == null}
            >
              {selectedPlan === 'free' ? 'Upgrade' : 'Downgrade'}
            </Button>
          )}
        </div>
      </div>
      <div className='plan__item plan__item--pro'>
        <div className='plan__item__header'>
          <label className='plan__item__title'>Pro</label>
          <div
            className={cc([
              'plan__item__price',
              discounted && 'plan__item__price--discounted',
            ])}
          >
            <span className='plan__item__price__default'>
              ${stripeProPlanUnit}
            </span>
            {discounted && (
              <span className='plan__item__price__discount'>
                $
                {Math.round(
                  stripeProPlanUnit -
                    stripeProPlanUnit *
                      (discountPlans.newSpace.percentageOff / 100)
                )}
              </span>
            )}
            <div className='plan__item__price__description'>
              {translate(lngKeys.PlanPerMember)}{' '}
              {translate(lngKeys.PlanPerMonth)}
            </div>
          </div>
        </div>
        {discounted && (
          <div className='plan__item__discount'>
            {translate(lngKeys.PlanDiscountDetail, {
              off: discountPlans.newSpace.percentageOff,
              month: discountPlans.newSpace.durationInMonths,
            })}
          </div>
        )}
        <div className='plan__item__perks'>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanProPerk1)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanProPerk2)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>{translate(lngKeys.PlanProPerk3)}</span>
          </div>
          <div className='plan__item__perk'>
            <span>
              {translate(lngKeys.PlanStoragePerk, {
                storageSize: `${proPlanStorageMb / 1000}GB`,
              })}
            </span>
          </div>
        </div>
        <div className='plan__item__footer'>
          {selectedPlan === 'pro' ? (
            <Button
              className='upgrade__btn'
              disabled={true}
              variant='secondary'
            >
              Current Plan
            </Button>
          ) : (
            <Button
              onClick={onProCallback}
              className='upgrade__btn'
              disabled={onProCallback == null}
            >
              Upgrade
            </Button>
          )}
          {freeTrialContent}
        </div>
      </div>
    </Container>
  )
}

const footerPadding = 100
const Container = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .plan__item__footer {
    position: absolute;
    bottom: 0;
    height: ${footerPadding}px;
    width: 100%;
    left: 0;

    .upgrade__btn,
    .free__trial__btn {
      width: 100%;
      display: flex;
    }

    > * {
      margin: 0;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  .plan__item__perks {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .plan__item__perk {
    position: relative;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: flex-start;

    &::before {
      content: '✓';
      display: block;
      color: ${({ theme }) => theme.colors.text.link};
      font-size: ${({ theme }) => theme.sizes.fonts.l}px;
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      line-height: ${({ theme }) => theme.sizes.fonts.df}px;
    }
  }

  .plan__item__perk + .plan__item__perk {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .plan__item__discount {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    color: ${({ theme }) => theme.colors.variants.warning.base};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

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
      font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
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

  &.plans--mobile {
    flex-wrap: wrap;
    width: 100%;
    flex: 0 0 auto;
  }

  .plan__item {
    text-align: left;
    width: 29%;
    margin: 0 2%;
    padding-bottom: ${footerPadding}px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`

export default PlanTables

import { formatDistanceToNow } from 'date-fns'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import { SerializedTeam } from '../../interfaces/db/team'
import { SubscriptionPeriod, UpgradePlans } from '../../lib/stripe'
import {
  freeTrialPeriodDays,
  paidPlanUploadSizeMb,
  proPlanStorageMb,
  revisionHistoryStandardDays,
  standardPlanStorageMb,
} from '../../lib/subscription'
import cc from 'classcat'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { ExternalLink } from '../../../design/components/atoms/Link'
import Pastille from '../../../design/components/atoms/Pastille'
import Switch from '../../../design/components/atoms/Switch'
import SubscriptionPlanHeader from './SubscriptionPlanHeader'
import Flexbox from '../../../design/components/atoms/Flexbox'
import plur from 'plur'

interface SubscriptionPlansTablesProps {
  team: SerializedTeam
  subscription?: SerializedSubscription
  selectedPlan: UpgradePlans | 'free'
  selectedPeriod?: SubscriptionPeriod
  discounted?: boolean
  freePlanFooter?: React.ReactNode
  hidePeriod?: boolean
  onFreeCallback?: () => void
  onStandardCallback?: () => void
  onProCallback?: () => void
  onTrialCallback?: () => void
  setSelectedPeriod?: React.Dispatch<React.SetStateAction<SubscriptionPeriod>>
}

const SubscriptionPlanTables = ({
  team,
  selectedPlan,
  selectedPeriod = 'yearly',
  hidePeriod = false,
  setSelectedPeriod,
  onTrialCallback,
  onStandardCallback,
  onProCallback,
  subscription,
  discounted,
}: SubscriptionPlansTablesProps) => {
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
        {translate(lngKeys.PlanTrial, { days: freeTrialPeriodDays })}
      </Button>
    )
  }, [subscription, team, onTrialCallback, translate])

  return (
    <Container className={cc(['plans', isTabletOrMobile && 'plans--mobile'])}>
      <table className='plans__table'>
        <tbody>
          <tr className='plans__table__row--header'>
            <td>
              {!hidePeriod && (
                <div className='plans__period'>
                  <span>Annual</span>
                  <Switch
                    checked={selectedPeriod === 'monthly'}
                    inverted={true}
                    disabled={setSelectedPeriod == null}
                    onChange={() => {
                      if (setSelectedPeriod != null) {
                        setSelectedPeriod(
                          selectedPeriod === 'yearly' ? 'monthly' : 'yearly'
                        )
                      }
                    }}
                  />
                  <span>Monthly</span>
                </div>
              )}
            </td>
            <td>
              <SubscriptionPlanHeader
                period={selectedPeriod}
                plan='standard'
                discounted={discounted}
              />
              <div className='plan__item__footer'>
                {selectedPlan === 'standard' ? (
                  <Button
                    className='upgrade__btn'
                    disabled={true}
                    size='lg'
                    variant='secondary'
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={onStandardCallback}
                    className='upgrade__btn'
                    size='lg'
                    disabled={onStandardCallback == null}
                  >
                    {selectedPlan === 'free' ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </div>
            </td>
            <td>
              <SubscriptionPlanHeader
                period={selectedPeriod}
                plan='pro'
                discounted={discounted}
              />
              <div className='plan__item__footer'>
                {selectedPlan === 'pro' ? (
                  <Button
                    className='upgrade__btn'
                    disabled={true}
                    variant='secondary'
                    size='lg'
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={onProCallback}
                    className='upgrade__btn'
                    disabled={onProCallback == null}
                    size='lg'
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <Flexbox>
                Members
                <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'>
                  <Pastille variant='secondary'>?</Pastille>
                </ExternalLink>
              </Flexbox>
            </td>
            <td>Unlimited</td>
            <td>Unlimited</td>
          </tr>
          <tr>
            <td>Documents</td>
            <td>Unlimited</td>
            <td>Unlimited</td>
          </tr>

          <tr>
            <td>Storage Limit</td>
            <td>{standardPlanStorageMb / 1000}GB per member</td>
            <td>{proPlanStorageMb / 1000}GB per member</td>
          </tr>

          <tr>
            <td>Dashboards</td>
            <td>Unlimited</td>
            <td>Unlimited</td>
          </tr>

          <tr>
            <td>Integrations</td>
            <td>2000+ integrations</td>
            <td>2000+ integrations</td>
          </tr>

          <tr>
            <td>Collaborative Workspace</td>
            <td className='marked'>&#x2713;</td>
            <td className='marked'>&#x2713;</td>
          </tr>

          <tr>
            <td>Revision History</td>
            <td className='marked'>
              Last {revisionHistoryStandardDays}{' '}
              {plur('day', revisionHistoryStandardDays)}
            </td>
            <td className='marked'>&#x2713;</td>
          </tr>

          <tr>
            <td>File upload size</td>
            <td className='marked'>{paidPlanUploadSizeMb}Mb per file</td>
            <td className='marked'>{paidPlanUploadSizeMb}Mb per file</td>
          </tr>

          <tr>
            <td>Guest Invite</td>
            <td>&#x2717;</td>
            <td className='marked'>&#x2713;</td>
          </tr>

          <tr>
            <td>Password/Expiration date for sharing</td>
            <td>&#x2717;</td>
            <td className='marked'>&#x2713;</td>
          </tr>

          <tr>
            <td>Priority Support</td>
            <td>&#x2717;</td>
            <td className='marked'>&#x2713;</td>
          </tr>

          <tr>
            <td>Free trial</td>
            <td>&#x2717;</td>
            <td>{freeTrialContent}</td>
          </tr>
        </tbody>
      </table>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .plans__table {
    border-collapse: separate;
    min-width: 100%;
    table-layout: fixed;
    border-spacing: 20px 0;

    td {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};

      &.marked {
        color: ${({ theme }) => theme.colors.text.link};
      }
    }

    td:not(:first-of-type) {
      width: 200px;
      max-width: 200px;
      min-width: 200px;
    }

    tr:not(.plans__table__row--header) td:first-of-type {
      color: ${({ theme }) => theme.colors.text.subtle};
      height: 46px;
    }

    tr:not(.plans__table__row--header) td:not(:first-of-type) {
      padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }

  .plans__table__row--header {
    vertical-align: bottom;
  }

  .plans__period {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    justify-content: flex-end;

    > * {
      margin: 0px ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .plan__item__footer {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;

    .upgrade__btn,
    .free__trial__btn {
      width: 100%;
      display: flex;
    }
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

  &.plans--mobile {
    flex-wrap: wrap;
    width: 100%;
    flex: 0 0 auto;
  }
`

export default SubscriptionPlanTables

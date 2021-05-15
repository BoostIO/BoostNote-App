import { formatDistanceToNow } from 'date-fns'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SerializedTeam } from '../../../interfaces/db/team'
import { UpgradePlans } from '../../../lib/stripe'
import styled from '../../../lib/styled'
import {
  freePlanDocLimit,
  freePlanStorageMb,
  proPlanStorageMb,
  revisionHistoryStandardDays,
  standardPlanStorageMb,
} from '../../../lib/subscription'
import cc from 'classcat'
import Button from '../../../../shared/components/atoms/Button'

interface PlanTablesProps {
  team: SerializedTeam
  subscription?: SerializedSubscription
  selectedPlan: UpgradePlans | 'free'
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
}: PlanTablesProps) => {
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1080 })

  const freeTrialContent = useMemo(() => {
    if (team == null) {
      return null
    }
    if (subscription != null) {
      if (subscription.status !== 'trialing') {
        return null
      }

      const trialEndDate = new Date(subscription.currentPeriodEnd * 1000)
      return (
        <p>
          <span className='check'>&#x2713;</span> In free trial ({' '}
          {formatDistanceToNow(trialEndDate, { includeSeconds: false })} left )
        </p>
      )
    }

    if (!team.trial || onTrialCallback == null) {
      return null
    }

    return (
      <p>
        <StyledTrialLink
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            onTrialCallback()
          }}
        >
          7 days free trial
        </StyledTrialLink>
      </p>
    )
  }, [subscription, team, onTrialCallback])

  return (
    <Container className={cc([isTabletOrMobile && 'mobile__layout'])}>
      <table>
        <thead>
          <tr>
            <td className='first' />
            <td className='header'>
              <label>Free</label>
              <div className='pricing'>
                <span>$0</span>
                <div>
                  per user
                  <br />
                  per month
                </div>
              </div>

              {selectedPlan === 'free' ? (
                <Button
                  className='upgrade-btn'
                  disabled={true}
                  variant='secondary'
                >
                  Current Plan
                </Button>
              ) : (
                <Button onClick={onFreeCallback} className='upgrade-btn'>
                  Downgrade
                </Button>
              )}
            </td>

            <td className='header'>
              <label>Standard</label>
              <div className='pricing'>
                <span>$3</span>
                <div>
                  per user
                  <br />
                  per month
                </div>
              </div>
              {selectedPlan === 'standard' ? (
                <Button
                  className='upgrade-btn'
                  disabled={true}
                  variant='secondary'
                >
                  Current Plan
                </Button>
              ) : (
                <Button onClick={onStandardCallback} className='upgrade-btn'>
                  {selectedPlan === 'free' ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </td>

            <td className='header'>
              <label>Pro</label>
              <div className='pricing'>
                <span>$8</span>
                <div>
                  per user
                  <br />
                  per month
                </div>
              </div>

              {selectedPlan === 'pro' ? (
                <Button
                  className='upgrade-btn'
                  disabled={true}
                  variant='secondary'
                >
                  Current Plan
                </Button>
              ) : (
                <Button onClick={onProCallback} className='upgrade-btn'>
                  Upgrade
                </Button>
              )}
              {freeTrialContent}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='first'>Members</td>
            <td>
              <div className='perk'>Unlimited</div>
            </td>
            <td>
              <div className='perk'>Unlimited</div>
            </td>
            <td>
              <div className='perk'>Unlimited</div>
            </td>
          </tr>

          <tr>
            <td className='first'>Documents</td>
            <td>
              <div className='perk'>{freePlanDocLimit} per team</div>
            </td>
            <td>
              <div className='perk'>Unlimited</div>
            </td>
            <td>
              <div className='perk'>Unlimited</div>
            </td>
          </tr>

          <tr>
            <td className='first'>Storage limit</td>
            <td>
              <div className='perk'>{freePlanStorageMb}MB per member</div>
            </td>
            <td>
              <div className='perk'>
                {standardPlanStorageMb / 1000}GB per member
              </div>
            </td>
            <td>
              <div className='perk'>{proPlanStorageMb / 1000}GB per member</div>
            </td>
          </tr>

          <tr>
            <td className='first'>Integrations</td>
            <td>
              <div className='perk'>2000+ integrations</div>
            </td>
            <td>
              <div className='perk'>2000+ integrations</div>
            </td>
            <td>
              <div className='perk'>2000+ integrations</div>
            </td>
          </tr>

          <tr>
            <td className='first'>Collaborative workspace</td>
            <td>
              <div className='perk'>&#x2713;</div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className='first'>Revision History</td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>
                  Last {revisionHistoryStandardDays} days
                </span>
              </div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className='first'>Guest invite</td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className='first'>Password/Expiration date for sharing</td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className='first'>Priority support</td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>&#x292C;</div>
            </td>
            <td>
              <div className='perk'>
                <span className='check'>&#x2713;</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </Container>
  )
}

const StyledTrialLink = styled.a`
  text-decoration: underline;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  transition: 200ms color;
  color: ${({ theme }) => theme.primaryTextColor};
  &:hover {
    text-decoration: none;
  }
`

const Container = styled.div`
  width: 100%;
  overflow: auto;

  &.mobile__layout {
    border-spacing: 6px 0;
  }

  > table {
    margin-bottom: ${({ theme }) => theme.space.medium}px;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 20px 0;
    min-width: 600px;
  }

  .first {
    width: 30%;
  }

  .header {
    vertical-align: top;
  }

  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.space.small}px;
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    font-weight: 600;
  }

  .pricing {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;

    span {
      font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
      margin-right: ${({ theme }) => theme.space.xsmall}px;
    }
    div {
      font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
      line-height: 1;
      opacity: 0.6;
      width: 70px;
      padding-top: 2px;
    }
  }

  .upgrade-btn {
    width: 100%;
    margin: ${({ theme }) => theme.fontSizes.xsmall}px 0;
  }

  tr td {
    padding-top: ${({ theme }) => theme.space.xsmall}px;
    padding-bottom: ${({ theme }) => theme.space.xsmall}px;
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
    text-align: left;
    min-height: 30px;

    &:not(.first):not(.header) {
      padding: ${({ theme }) => theme.space.xsmall}px;
    }

    &.first {
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }

  .perk {
    line-height: 1.2;
    padding: 6px 0px;
  }

  .check {
    color: ${({ theme }) => theme.primaryTextColor};
    font-weight: bold;
  }
`

export default PlanTables

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Column,
  Scrollable,
  Section,
  SectionRow,
  TabHeader,
  StyledSmallFont,
} from './styled'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import SubscriptionForm from '../../molecules/SubscriptionForm'
import { useToast } from '../../../lib/stores/toast'
import { useSettings } from '../../../lib/stores/settings'
import CustomButton from '../../atoms/buttons/CustomButton'
import styled from '../../../lib/styled'
import { useGlobalData } from '../../../lib/stores/globalData'
import ColoredBlock from '../../atoms/ColoredBlock'
import {
  freePlanDocLimit,
  freePlanStorageMb,
  standardPlanStorageMb,
  proPlanStorageMb,
  revisionHistoryStandardDays,
} from '../../../lib/subscription'
import FreeTrialPopup from '../FreeTrialPopup'
import { stripePublishableKey } from '../../../lib/consts'
import CustomLink from '../../atoms/Link/CustomLink'
import { formatDistanceToNow } from 'date-fns'

const stripePromise = loadStripe(stripePublishableKey)

type UpgradeTabs = 'plans' | 'form'

const UpgradeTab = () => {
  const { t } = useTranslation()
  const {
    team,
    subscription,
    updateTeamSubscription,
    permissions = [],
  } = usePage<PageStoreWithTeam>()
  const { pushMessage } = useToast()
  const [tabState, setTabState] = useState<UpgradeTabs>('plans')
  const { openSettingsTab } = useSettings()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const [showTrialPopup, setShowTrialPopup] = useState(false)

  useEffect(() => {
    if (subscription != null && subscription.status !== 'trialing') {
      openSettingsTab('teamSubscription')
    }
  }, [subscription, openSettingsTab])

  const onUpgradeCallback = useCallback(() => {
    setTabState('form')
  }, [])

  const onSuccessCallback = useCallback(
    (sub) => {
      updateTeamSubscription(sub)
    },
    [updateTeamSubscription]
  )

  const onCancelCallback = useCallback(() => {
    setTabState('plans')
  }, [])

  const currentUserPermissions = useMemo(() => {
    return permissions.find(
      (permission) => permission.user.id === currentUser!.id
    )
  }, [currentUser, permissions])

  const freeTrialContent = useMemo(() => {
    if (
      team == null ||
      currentUserPermissions == null ||
      currentUserPermissions.role !== 'admin'
    ) {
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

    if (!team.trial) {
      return null
    }

    return (
      <p>
        <StyledTrialLink
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            setShowTrialPopup(true)
          }}
        >
          Try it for free
        </StyledTrialLink>
      </p>
    )
  }, [subscription, currentUserPermissions, team])

  if (
    team == null ||
    (subscription != null && subscription.status === 'active') ||
    currentUserPermissions == null
  ) {
    return null
  }

  if (tabState === 'plans') {
    return (
      <Column>
        {showTrialPopup && (
          <FreeTrialPopup team={team} close={() => setShowTrialPopup(false)} />
        )}
        <Scrollable>
          <Section>
            <StyledSmallFont>
              <TabHeader>{t('settings.teamUpgrade')}</TabHeader>

              <StyledPlanTables>
                <thead>
                  <tr>
                    <td className='first' />
                    <td className='header'>
                      <label>Free</label>
                      <div className='pricing'>
                        <span>$0</span>
                      </div>

                      <CustomButton
                        className='upgrade-btn'
                        disabled={true}
                        variant='inverse-secondary'
                      >
                        Current Plan
                      </CustomButton>
                    </td>

                    <td className='header'>
                      <label>Standard</label>
                      <div className='pricing'>
                        <span>$3</span>
                        <div>per member per month</div>
                      </div>
                      <CustomButton
                        onClick={onUpgradeCallback}
                        className='upgrade-btn'
                      >
                        Upgrade
                      </CustomButton>
                    </td>

                    <td className='header'>
                      <label>Pro</label>
                      <div className='pricing'>
                        <span>$8</span>
                        <div>per member per month</div>
                      </div>

                      <CustomButton
                        onClick={onUpgradeCallback}
                        className='upgrade-btn'
                      >
                        Upgrade
                      </CustomButton>
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
                      <div className='perk'>
                        {freePlanStorageMb}MB per member
                      </div>
                    </td>
                    <td>
                      <div className='perk'>
                        {standardPlanStorageMb / 100}GB per member
                      </div>
                    </td>
                    <td>
                      <div className='perk'>
                        {proPlanStorageMb / 100}GB per member
                      </div>
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
                    <td className='first'>Templates</td>
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
                    <td className='first'>Collaborative workspace</td>
                    <td>
                      <div className='perk'>&#x292C;</div>
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
                    <td className='first'>Private folders</td>
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
                    <td className='first'>
                      Password/Expiration date for sharing
                    </td>
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

                  <tr>
                    <td className='first'>Mobile App</td>
                    <td>
                      <div className='perk'>
                        <span className='check'>&#x2713;</span> (Soon)
                      </div>
                    </td>
                    <td>
                      <div className='perk'>
                        <span className='check'>&#x2713;</span> (Soon)
                      </div>
                    </td>
                    <td>
                      <div className='perk'>
                        <span className='check'>&#x2713;</span> (Soon)
                      </div>
                    </td>
                  </tr>
                </tbody>
              </StyledPlanTables>
              <p>
                * For larger businesses or those in highly regulated industries,
                please{' '}
                <CustomLink
                  href='https://forms.gle/LqzQ2Tcfd6noWH6b9'
                  target='_blank'
                  rel='noopener noreferrer'
                  isReactLink={false}
                >
                  contact our sales department
                </CustomLink>
                .
              </p>
            </StyledSmallFont>
          </Section>
        </Scrollable>
      </Column>
    )
  }

  return (
    <Column>
      <Scrollable>
        <Section>
          <StyledSmallFont>
            <TabHeader>{t('settings.teamUpgrade')}</TabHeader>

            {currentUserPermissions.role !== 'admin' ? (
              <ColoredBlock variant='danger'>
                Only admins can access this content.
              </ColoredBlock>
            ) : (
              !(subscription != null && subscription.status === 'active') && (
                <SectionRow>
                  <Elements stripe={stripePromise}>
                    <SubscriptionForm
                      team={team}
                      onError={(err) =>
                        pushMessage({
                          title: 'Subscription Error',
                          description: err.message,
                        })
                      }
                      ongoingTrial={
                        subscription != null &&
                        subscription.status === 'trialing'
                      }
                      onSuccess={onSuccessCallback}
                      onCancel={onCancelCallback}
                    />
                  </Elements>
                </SectionRow>
              )
            )}
          </StyledSmallFont>
        </Section>
      </Scrollable>
    </Column>
  )
}

export default UpgradeTab

const StyledPlanTables = styled.table`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.space.medium}px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 30px 0;

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

    &:not(.first) {
      padding: ${({ theme }) => theme.space.xsmall}px
        ${({ theme }) => theme.space.small}px;
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

const StyledTrialLink = styled.a`
  text-decoration: underline;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  transition: 200ms color;
  color: ${({ theme }) => theme.primaryTextColor};
  &:hover {
    text-decoration: none;
  }
`

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
import { freePlanDocLimit } from '../../../lib/subscription'
import Tooltip from '../../atoms/Tooltip'
import FreeTrialPopup from '../FreeTrialPopup'
import { stripePublishableKey } from '../../../lib/consts'

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

      return <p>&#x2713; In free trial</p>
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
                    <td>
                      <label>Free</label>
                      <div className='pricing'>
                        <span>$0</span>
                      </div>

                      <CustomButton
                        className='upgrade-btn'
                        disabled={true}
                        variant='inverse-secondary'
                      >
                        Current
                      </CustomButton>
                    </td>

                    <td>
                      <label>Personal Pro</label>
                      <div className='pricing'>
                        <span>$3</span>
                        <div>per month</div>
                      </div>

                      {permissions.length > 1 ? (
                        <Tooltip
                          tooltip={
                            <div style={{ maxWidth: 250 }}>
                              The Personal Pro Plan is only available for
                              1-person use. If you would like to use this plan,
                              please remove the other members in this team.
                            </div>
                          }
                          side='top'
                        >
                          <CustomButton
                            disabled={true}
                            variant='inverse-secondary'
                            className='upgrade-btn'
                          >
                            Upgrade
                          </CustomButton>
                        </Tooltip>
                      ) : (
                        <CustomButton
                          onClick={onUpgradeCallback}
                          className='upgrade-btn'
                        >
                          Upgrade
                        </CustomButton>
                      )}
                      {freeTrialContent}
                    </td>

                    <td>
                      <label>Pro</label>
                      <div className='pricing'>
                        <span>$8</span>
                        <div>per member per month</div>
                      </div>

                      {permissions.length < 2 ? (
                        <Tooltip
                          tooltip={
                            <div style={{ maxWidth: 250 }}>
                              The Pro Plan is only available for more than 2
                              persons use. Your plan will be upgraded
                              immediately to pro plan if you invite new members
                              while having an active personal pro plan.
                            </div>
                          }
                          side='top'
                        >
                          <CustomButton
                            disabled={true}
                            variant='inverse-secondary'
                            className='upgrade-btn'
                          >
                            Upgrade
                          </CustomButton>
                        </Tooltip>
                      ) : (
                        <CustomButton
                          onClick={onUpgradeCallback}
                          className='upgrade-btn'
                        >
                          Upgrade
                        </CustomButton>
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
                      <div className='perk'>Just you</div>
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
                    <td className='first'>Storage lmit</td>
                    <td>
                      <div className='perk'>1GB per member</div>
                    </td>
                    <td>
                      <div className='perk'>10GB</div>
                    </td>
                    <td>
                      <div className='perk'>10GB per member</div>
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
                      <div className='perk'>&#x292C;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                  </tr>

                  <tr>
                    <td className='first'>Revision History</td>
                    <td>
                      <div className='perk'>&#x292C;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                  </tr>

                  <tr>
                    <td className='first'>Private folders</td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                  </tr>

                  <tr>
                    <td className='first'>Guest invite</td>
                    <td>
                      <div className='perk'>&#x292C;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
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
                      <div className='perk'>&#x2713;</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713;</div>
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
                      <div className='perk'>&#x2713;</div>
                    </td>
                  </tr>

                  <tr>
                    <td className='first'>Mobile App</td>
                    <td>
                      <div className='perk'>&#x2713; (Soon)</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713; (Soon)</div>
                    </td>
                    <td>
                      <div className='perk'>&#x2713; (Soon)</div>
                    </td>
                  </tr>
                </tbody>
              </StyledPlanTables>
              <p>
                * The subscription fee will automatically be updated when team
                members are added and removed.
              </p>
              <p>
                * For larger businesses or those in highly regulated industries,
                please{' '}
                <a
                  href='https://forms.gle/LqzQ2Tcfd6noWH6b9'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  contact our sales department
                </a>
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
  border-collapse: initial;
  border-spacing: 0;

  .first {
    width: 30%;
  }

  label {
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    font-weight: 600;
  }

  .pricing {
    display: flex;
    span {
      font-size: ${({ theme }) => theme.fontSizes.large}px;
      margin-right: ${({ theme }) => theme.space.small}px;
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
    margin: ${({ theme }) => theme.fontSizes.xsmall}px 0;
  }

  tr td {
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
    border-right: 1px solid ${({ theme }) => theme.subtleBorderColor};
    text-align: left;
    min-height: 30px;
    vertical-align: top;
    &:not(.first) {
      padding: 0 10px;
    }

    &.first {
      padding-top: 6px;
      padding-bottom: 8px;
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }

  .perk {
    line-height: 1.2;
    padding: 6px 0px;
  }
`

const StyledTrialLink = styled.a`
  text-decoration: underline;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  transition: 200ms color;
  color: ${({ theme }) => theme.secondaryTextColor};
  &:hover {
    color: ${({ theme }) => theme.primaryBackgroundColor};
  }
`

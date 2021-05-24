import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import SubscriptionForm from '../../molecules/SubscriptionForm'
import { useSettings } from '../../../lib/stores/settings'
import { useGlobalData } from '../../../lib/stores/globalData'
import ColoredBlock from '../../atoms/ColoredBlock'
import FreeTrialPopup from '../FreeTrialPopup'
import { stripePublishableKey } from '../../../lib/consts'
import PlanTables from '../Subscription/PlanTables'
import { UpgradePlans } from '../../../lib/stripe'
import styled from '../../../lib/styled'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import { ExternalLink } from '../../../../shared/components/atoms/Link'
import {
  isEligibleForDiscount,
  newTeamDiscountDays,
} from '../../../lib/subscription'
import Banner from '../../../../shared/components/atoms/Banner'
import { mdiGift } from '@mdi/js'
import { format } from 'date-fns'

const stripePromise = loadStripe(stripePublishableKey)

type UpgradeTabs = 'plans' | 'form'

export interface UpgradeTabOpeningOptions {
  tabState?: UpgradeTabs
  showTrialPopup?: boolean
  initialPlan?: UpgradePlans
}

const UpgradeTab = ({
  tabState: defaultTabState = 'plans',
  showTrialPopup: defaultShowTrial = false,
  initialPlan: defaultInitialPlan = 'standard',
}: UpgradeTabOpeningOptions) => {
  const { t } = useTranslation()
  const {
    team,
    subscription,
    updateTeamSubscription,
    permissions = [],
  } = usePage<PageStoreWithTeam>()
  const [tabState, setTabState] = useState<UpgradeTabs>(defaultTabState)
  const { openSettingsTab } = useSettings()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const [showTrialPopup, setShowTrialPopup] = useState(defaultShowTrial)
  const [initialPlan, setInitialPlan] = useState<UpgradePlans>(
    defaultInitialPlan
  )

  useEffect(() => {
    if (subscription != null && subscription.status !== 'trialing') {
      openSettingsTab('teamSubscription')
    }
  }, [subscription, openSettingsTab])

  const onUpgradeCallback = useCallback((initialPlan: UpgradePlans) => {
    setInitialPlan(initialPlan)
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

  if (
    team == null ||
    (subscription != null && subscription.status === 'active') ||
    currentUserPermissions == null
  ) {
    return null
  }

  const eligibilityEnd = new Date(team.createdAt)
  eligibilityEnd.setDate(eligibilityEnd.getDate() + newTeamDiscountDays)
  const teamIsEligibleForDiscount = isEligibleForDiscount(team)
  if (tabState === 'plans') {
    return (
      <SettingTabContent
        title={t('settings.teamUpgrade')}
        description={'Choose your plan.'}
        body={
          <>
            {showTrialPopup && (
              <FreeTrialPopup
                team={team}
                close={() => setShowTrialPopup(false)}
              />
            )}
            <section>
              {teamIsEligibleForDiscount && (
                <Banner variant='warning' iconPath={mdiGift}>
                  You will receive a discount as long as you subscribe before{' '}
                  <strong>{format(eligibilityEnd, 'H:m, dd MMM yyyy')}</strong>
                </Banner>
              )}
              <PlanTables
                team={team}
                subscription={subscription}
                selectedPlan='free'
                onStandardCallback={() => onUpgradeCallback('standard')}
                onProCallback={() => onUpgradeCallback('pro')}
                onTrialCallback={() => setShowTrialPopup(true)}
                discounted={teamIsEligibleForDiscount}
              />
              <StyledFYI>
                * For larger businesses or those in highly regulated industries,
                please{' '}
                <ExternalLink href='https://forms.gle/LqzQ2Tcfd6noWH6b9'>
                  contact our sales department
                </ExternalLink>
                .
              </StyledFYI>
            </section>
          </>
        }
      ></SettingTabContent>
    )
  }

  return (
    <SettingTabContent
      title={t('settings.teamUpgrade')}
      description={
        <>
          Confirm and enter your payment information (Service provided by{' '}
          <ExternalLink href='https://stripe.com/'>Stripe</ExternalLink>)
        </>
      }
      body={
        <SubscriptionFormContainer>
          {currentUserPermissions.role !== 'admin' ? (
            <ColoredBlock variant='danger'>
              Only admins can access this content.
            </ColoredBlock>
          ) : (
            !(subscription != null && subscription.status === 'active') && (
              <Elements stripe={stripePromise}>
                <SubscriptionForm
                  team={team}
                  initialPlan={initialPlan}
                  ongoingTrial={
                    subscription != null && subscription.status === 'trialing'
                  }
                  onSuccess={onSuccessCallback}
                  onCancel={onCancelCallback}
                />
              </Elements>
            )
          )}
        </SubscriptionFormContainer>
      }
    ></SettingTabContent>
  )
}

const SubscriptionFormContainer = styled.div``

const StyledFYI = styled.p`
  .type-link {
    text-decoration: underline;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.primaryTextColor};
      text-decoration: none;
    }
  }
`

export default UpgradeTab

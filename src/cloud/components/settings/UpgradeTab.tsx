/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect, useCallback } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import SubscriptionForm from '../SubscriptionForm'
import { useSettings } from '../../lib/stores/settings'
import FreeTrialPopup from '../FreeTrialPopup'
import { stripePublishableKey } from '../../lib/consts'
import { SubscriptionPeriod, UpgradePlans } from '../../lib/stripe'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { ExternalLink } from '../../../design/components/atoms/Link'
import {
  isTimeEligibleForDiscount,
  newTeamDiscountDays,
} from '../../lib/subscription'
import Banner from '../../../design/components/atoms/Banner'
import { mdiGift } from '@mdi/js'
import { format } from 'date-fns'
import { useElectron } from '../../lib/stores/electron'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import SubscriptionPlanTables from '../Subscription/SubscriptionPlanTables'

const stripePromise = loadStripe(stripePublishableKey)

type UpgradeTabs = 'plans' | 'form'

export interface UpgradeTabOpeningOptions {
  tabState?: UpgradeTabs
  showTrialPopup?: boolean
  initialPlan?: UpgradePlans
  initialPeriod?: SubscriptionPeriod
}

const UpgradeTab = ({
  tabState: defaultTabState = 'plans',
  showTrialPopup: defaultShowTrial = false,
  initialPlan: defaultInitialPlan = 'standard',
  initialPeriod: defaultInitialPeriod = 'yearly',
}: UpgradeTabOpeningOptions) => {
  const { translate } = useI18n()
  const { team, subscription, updateTeamSubscription, currentUserPermissions } =
    usePage<PageStoreWithTeam>()
  const { usingElectron, sendToElectron } = useElectron()
  const [tabState, setTabState] = useState<UpgradeTabs>(defaultTabState)
  const { openSettingsTab } = useSettings()
  const [showTrialPopup, setShowTrialPopup] = useState(defaultShowTrial)
  const [period, setPeriod] = useState<SubscriptionPeriod>(defaultInitialPeriod)
  const [initialPlan, setInitialPlan] =
    useState<UpgradePlans>(defaultInitialPlan)

  useEffect(() => {
    if (
      subscription != null &&
      subscription.status !== 'trialing' &&
      subscription.status !== 'incomplete'
    ) {
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
      if (usingElectron) {
        sendToElectron('subscription-update', sub)
      }
      openSettingsTab('teamSubscription')
    },
    [updateTeamSubscription, usingElectron, sendToElectron, openSettingsTab]
  )

  const onCancelCallback = useCallback(() => {
    setTabState('plans')
  }, [])

  if (
    team == null ||
    (subscription != null && subscription.status === 'active') ||
    currentUserPermissions == null
  ) {
    return null
  }

  const eligibilityEnd = new Date(team.createdAt)
  eligibilityEnd.setDate(eligibilityEnd.getDate() + newTeamDiscountDays)
  const teamIsEligibleForDiscount = isTimeEligibleForDiscount(team)

  if (tabState === 'plans') {
    return (
      <SettingTabContent
        title={translate(lngKeys.SettingsTeamUpgrade)}
        description={translate(lngKeys.PlanChoose)}
        width={900}
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
                <Banner variant='warning' iconPath={mdiGift} rounded={true}>
                  {translate(lngKeys.PlanDiscountUntil)}{' '}
                  <strong>{format(eligibilityEnd, 'H:m, dd MMM yyyy')}</strong>
                </Banner>
              )}
              <SubscriptionPlanTables
                selectedPlan='free'
                onStandardCallback={() => onUpgradeCallback('standard')}
                onProCallback={() => onUpgradeCallback('pro')}
                discounted={teamIsEligibleForDiscount}
                selectedPeriod={period}
                setSelectedPeriod={setPeriod}
              />
            </section>
          </>
        }
      ></SettingTabContent>
    )
  }

  return (
    <SettingTabContent
      title={translate(lngKeys.SettingsTeamUpgrade)}
      width={900}
      description={
        <>
          {translate(lngKeys.UpgradeSubtitle)} (Service provided by{' '}
          <ExternalLink href='https://stripe.com/'>Stripe</ExternalLink>)
        </>
      }
      body={
        <div>
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
                  period={period}
                  ongoingTrial={
                    subscription != null && subscription.status === 'trialing'
                  }
                  onSuccess={onSuccessCallback}
                  onCancel={onCancelCallback}
                />
              </Elements>
            )
          )}
        </div>
      }
    ></SettingTabContent>
  )
}

export default UpgradeTab

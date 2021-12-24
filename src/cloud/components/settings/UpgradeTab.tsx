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
import PlanTables from '../Subscription/PlanTables'
import { UpgradePlans } from '../../lib/stripe'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { ExternalLink } from '../../../design/components/atoms/Link'
import {
  isTimeEligibleForDiscount,
  newTeamDiscountDays,
} from '../../lib/subscription'
import Banner from '../../../design/components/atoms/Banner'
import { mdiGift, mdiStar } from '@mdi/js'
import { format } from 'date-fns'
import { useElectron } from '../../lib/stores/electron'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import Icon from '../../../design/components/atoms/Icon'
import Flexbox from '../../../design/components/atoms/Flexbox'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'

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
  const { translate } = useI18n()
  const {
    team,
    subscription,
    updateTeamSubscription,
    currentUserPermissions,
  } = usePage<PageStoreWithTeam>()
  const { usingElectron, sendToElectron } = useElectron()
  const [tabState, setTabState] = useState<UpgradeTabs>(defaultTabState)
  const { openSettingsTab } = useSettings()
  const [showTrialPopup, setShowTrialPopup] = useState(defaultShowTrial)
  const [initialPlan, setInitialPlan] = useState<UpgradePlans>(
    defaultInitialPlan
  )

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
        body={
          <>
            {showTrialPopup && (
              <FreeTrialPopup
                team={team}
                close={() => setShowTrialPopup(false)}
              />
            )}
            <p style={{ textAlign: 'center' }}>
              ⚠️ We are rolling out{' '}
              <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/5821514-plan-changes-at-january-17th-2022'>
                new plans and pricing
              </ExternalLink>{' '}
              on 17th January, 2022
            </p>
            <section>
              {teamIsEligibleForDiscount && (
                <Banner variant='warning' iconPath={mdiGift}>
                  {translate(lngKeys.PlanDiscountUntil)}{' '}
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

              <Flexbox justifyContent='flex-start'>
                <Icon className='icon' size={20} path={mdiStar} />
                {translate(lngKeys.PlanViewersMembersIntro)}
                <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'>
                  {translate(lngKeys.PlanViewersMembersLink)}
                </ExternalLink>
                !
              </Flexbox>
              <p>
                * {translate(lngKeys.PlanBusinessIntro)}{' '}
                <ExternalLink href='https://forms.gle/LqzQ2Tcfd6noWH6b9'>
                  {translate(lngKeys.PlanBusinessLink)}
                </ExternalLink>
                .
              </p>
            </section>
          </>
        }
      ></SettingTabContent>
    )
  }

  return (
    <SettingTabContent
      title={translate(lngKeys.SettingsTeamUpgrade)}
      description={
        <>
          {translate(lngKeys.UpgradeSubtitle)} (Service provided by{' '}
          <ExternalLink href='https://stripe.com/'>Stripe</ExternalLink>)
        </>
      }
      body={
        <div>
          <p>
            ⚠️ We are rolling out{' '}
            <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/5821514-plan-changes-at-january-17th-2022'>
              new plans and pricing
            </ExternalLink>{' '}
            on 17th January, 2022
          </p>
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
        </div>
      }
    ></SettingTabContent>
  )
}

export default UpgradeTab

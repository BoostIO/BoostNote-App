import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import UpdateBillingEmailForm from '../../molecules/SubscriptionForm/UpdateBillingEmailForm'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import UpdateBillingMethodForm from '../../molecules/SubscriptionForm/UpdateBillingMethodForm'
import ColoredBlock from '../../atoms/ColoredBlock'
import { useSettings } from '../../../lib/stores/settings'
import styled from '../../../lib/styled'
import { stripePublishableKey } from '../../../lib/consts'
import SubscriptionManagement from '../Subscription/SubscriptionManagement'
import UpdateBillingPromoForm from '../../molecules/SubscriptionForm/UpdateBillingPromo'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const stripePromise = loadStripe(stripePublishableKey)

type SubscriptionFormTabs = 'method' | 'email' | 'promo'

const SubscriptionTab = () => {
  const { t } = useTranslation()
  const {
    team,
    subscription,
    currentUserPermissions,
    updateTeamSubscription,
  } = usePage<PageStoreWithTeam>()
  const [formtab, setFormTab] = useState<SubscriptionFormTabs | undefined>()
  const { openSettingsTab } = useSettings()

  const onSuccessHandler = useCallback(
    (subscription: SerializedSubscription) => {
      updateTeamSubscription(subscription)
      setFormTab(undefined)
    },
    [updateTeamSubscription]
  )

  useEffect(() => {
    if (subscription == null) {
      openSettingsTab('teamUpgrade')
    }
  }, [subscription, openSettingsTab])

  if (team == null || currentUserPermissions == null || subscription == null) {
    return null
  }

  if (currentUserPermissions.role !== 'admin') {
    return (
      <SettingTabContent
        body={
          <section>
            <ColoredBlock variant='danger'>
              Only admins can access this content.
            </ColoredBlock>
          </section>
        }
      ></SettingTabContent>
    )
  }

  if (subscription != null && subscription.status === 'trialing') {
    return (
      <SettingTabContent
        body={
          <section>
            <ColoredBlock variant='danger'>
              No active subscription. Your trial is underway
            </ColoredBlock>
          </section>
        }
      ></SettingTabContent>
    )
  }

  return (
    <SettingTabContent
      title={t('settings.teamSubscription')}
      body={
        <section>
          <p className='text--small'>
            {formtab == null ? (
              <SubscriptionManagement
                subscription={subscription}
                team={team}
                onEmailClick={() => setFormTab('email')}
                onMethodClick={() => setFormTab('method')}
                onPromoClick={() => setFormTab('promo')}
              />
            ) : (
              <StyledBillingContainer>
                {formtab === 'email' ? (
                  <UpdateBillingEmailForm
                    sub={subscription}
                    onSuccess={onSuccessHandler}
                    onCancel={() => setFormTab(undefined)}
                  />
                ) : formtab === 'method' ? (
                  <Elements stripe={stripePromise}>
                    <UpdateBillingMethodForm
                      sub={subscription}
                      onSuccess={onSuccessHandler}
                      onCancel={() => setFormTab(undefined)}
                    />
                  </Elements>
                ) : formtab === 'promo' ? (
                  <UpdateBillingPromoForm
                    sub={subscription}
                    onSuccess={() => setFormTab(undefined)}
                    onCancel={() => setFormTab(undefined)}
                  />
                ) : null}
              </StyledBillingContainer>
            )}
          </p>
        </section>
      }
    ></SettingTabContent>
  )
}

export default SubscriptionTab

const StyledBillingContainer = styled.div`
  width: 540px;
  margin-top: ${({ theme }) => theme.space.default}px;
`

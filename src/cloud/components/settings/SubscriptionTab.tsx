import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import UpdateBillingEmailForm from '../SubscriptionForm/UpdateBillingEmailForm'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import UpdateBillingMethodForm from '../SubscriptionForm/UpdateBillingMethodForm'
import { useSettings } from '../../lib/stores/settings'
import { stripePublishableKey } from '../../lib/consts'
import SubscriptionManagement from '../Subscription/SubscriptionManagement'
import UpdateBillingPromoForm from '../SubscriptionForm/UpdateBillingPromo'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import styled from '../../../design/lib/styled'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'

const stripePromise = loadStripe(stripePublishableKey)

type SubscriptionFormTabs = 'method' | 'email' | 'promo'

const SubscriptionTab = () => {
  const { t } = useTranslation()
  const { team, subscription, currentUserPermissions, updateTeamSubscription } =
    usePage<PageStoreWithTeam>()
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
      width={900}
      body={
        <section>
          <div className='text--small'>
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
                    onSuccess={onSuccessHandler}
                    onCancel={() => setFormTab(undefined)}
                  />
                ) : null}
              </StyledBillingContainer>
            )}
          </div>
        </section>
      }
    ></SettingTabContent>
  )
}

export default SubscriptionTab

const StyledBillingContainer = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
`

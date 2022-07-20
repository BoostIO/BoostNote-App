import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../../cloud/interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import UpdateBillingEmailForm from '../../../../cloud/components/SubscriptionForm/UpdateBillingEmailForm'
import { SerializedSubscription } from '../../../../cloud/interfaces/db/subscription'
import UpdateBillingMethodForm from '../../../../cloud/components/SubscriptionForm/UpdateBillingMethodForm'
import styled from '../../../../design/lib/styled'
import { stripePublishableKey } from '../../../../cloud/lib/consts'
import SettingTabContent from '../../../../design/components/organisms/Settings/atoms/SettingTabContent'
import SubscriptionManagement from '../../../../cloud/components/Subscription/SubscriptionManagement'
import ModalContainer from './atoms/ModalContainer'
import NavigationBarButton from '../../atoms/NavigationBarButton'
import { SettingsTabTypes } from './types'
import UpdateBillingPromoForm from '../../../../cloud/components/SubscriptionForm/UpdateBillingPromo'
import Icon from '../../../../design/components/atoms/Icon'
import { mdiArrowLeft } from '@mdi/js'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'

const stripePromise = loadStripe(stripePublishableKey)

type SubscriptionFormTabs = 'method' | 'email' | 'promo'

interface SpaceBillingsTabProps {
  setActiveTab: (tab: SettingsTabTypes | null) => void
}

const SpaceBillingsTab = ({ setActiveTab }: SpaceBillingsTabProps) => {
  const { t } = useTranslation()
  const { subscription, currentUserPermissions, updateTeamSubscription } =
    usePage<PageStoreWithTeam>()
  const [formtab, setFormTab] = useState<SubscriptionFormTabs | undefined>()

  const onSuccessHandler = useCallback(
    (subscription: SerializedSubscription) => {
      updateTeamSubscription(subscription)
      setFormTab(undefined)
    },
    [updateTeamSubscription]
  )

  if (
    currentUserPermissions == null ||
    currentUserPermissions.role !== 'admin'
  ) {
    return (
      <ModalContainer
        left={
          <NavigationBarButton onClick={() => setActiveTab(null)}>
            <Icon size={20} path={mdiArrowLeft} /> Back
          </NavigationBarButton>
        }
        title='Settings'
        closeLabel='Done'
      >
        <SettingTabContent
          body={
            <section>
              <ColoredBlock variant='danger'>
                Only admins can access this content.
              </ColoredBlock>
            </section>
          }
        ></SettingTabContent>
      </ModalContainer>
    )
  }

  if (subscription == null) {
    return (
      <ModalContainer
        left={
          <NavigationBarButton onClick={() => setActiveTab(null)}>
            <Icon size={20} path={mdiArrowLeft} /> Back
          </NavigationBarButton>
        }
        title='Settings'
        closeLabel='Done'
      >
        <SettingTabContent
          body={
            <section>
              <ColoredBlock variant='danger'>
                No active subscription.
              </ColoredBlock>
            </section>
          }
        ></SettingTabContent>
      </ModalContainer>
    )
  }

  if (subscription != null && subscription.status === 'trialing') {
    return (
      <ModalContainer
        left={
          <NavigationBarButton onClick={() => setActiveTab(null)}>
            <Icon size={20} path={mdiArrowLeft} /> Back
          </NavigationBarButton>
        }
        title='Settings'
        closeLabel='Done'
      >
        <SettingTabContent
          body={
            <section>
              <ColoredBlock variant='danger'>
                No active subscription. Your trial is underway
              </ColoredBlock>
            </section>
          }
        ></SettingTabContent>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer
      left={
        <NavigationBarButton onClick={() => setActiveTab(null)}>
          <Icon size={20} path={mdiArrowLeft} /> Back
        </NavigationBarButton>
      }
      title='Billings'
      closeLabel='Done'
    >
      <SettingTabContent
        title={t('settings.teamSubscription')}
        body={
          <section>
            <div className='text--small'>
              {formtab == null ? (
                <SubscriptionManagement
                  subscription={subscription}
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
      />
    </ModalContainer>
  )
}

export default SpaceBillingsTab

const StyledBillingContainer = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
`

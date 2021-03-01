import React, { useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Column,
  Scrollable,
  Section,
  SectionRow,
  TabHeader,
  SectionIntroduction,
  StyledSmallFont,
  SectionDescription,
  SectionParagraph,
  SectionInput,
} from './styled'
import {
  cancelSubscription,
  reactivateSubscription,
  redeemPromo,
} from '../../../api/teams/subscription'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import SubscriptionForm, {
  StyledCalcuration,
  StyledTotal,
  StyledUpgradePlan,
} from '../../molecules/SubscriptionForm'
import { useToast } from '../../../lib/stores/toast'
import CustomButton from '../../atoms/buttons/CustomButton'
import UpdateBillingEmailForm from '../../molecules/SubscriptionForm/UpdateBillingEmailForm'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import UpdateBillingMethodForm from '../../molecules/SubscriptionForm/UpdateBillingMethodForm'
import { Spinner } from '../../atoms/Spinner'
import { getFormattedDateFromUnixTimestamp } from '../../../lib/date'
import { stripeProPlanUnit, stripeStandardPlanUnit } from '../../../lib/stripe'
import { useGlobalData } from '../../../lib/stores/globalData'
import ColoredBlock from '../../atoms/ColoredBlock'
import plur from 'plur'
import { useDialog, DialogIconTypes } from '../../../lib/stores/dialog'
import { getTeamPortalUrl } from '../../../api/teams/subscription/invoices'
import { useSettings } from '../../../lib/stores/settings'
import styled from '../../../lib/styled'
import Flexbox from '../../atoms/Flexbox'
import { mdiOpenInNew } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import { stripePublishableKey } from '../../../lib/consts'

const stripePromise = loadStripe(stripePublishableKey)

type SubscriptionFormTabs = 'method' | 'email'

const SubscriptionTab = () => {
  const { t } = useTranslation()
  const {
    team,
    subscription,
    permissions = [],
    updateTeamSubscription,
  } = usePage<PageStoreWithTeam>()
  const { pushMessage, pushAxiosErrorMessage } = useToast()
  const [formtab, setFormTab] = useState<SubscriptionFormTabs | undefined>()
  const [cancelling, setCancelling] = useState<boolean>(false)
  const [activating, setActivating] = useState<boolean>(false)
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false)
  const [promoCode, setPromoCode] = useState('')
  const [fetching, setFetching] = useState<boolean>(false)
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const { messageBox } = useDialog()
  const { openSettingsTab } = useSettings()

  const cancellingCallback = useCallback(() => {
    if (subscription == null || subscription.status === 'canceled') {
      return
    }

    messageBox({
      title: `Cancel your subscription?`,
      message: `Are you sure to cancel your subscription? You will immediately lose the associated perks.`,
      iconType: DialogIconTypes.Warning,
      buttons: ['Unsubscribe', t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        switch (value) {
          case 0:
            setCancelling(true)
            cancelSubscription(subscription.teamId)
              .then(({ subscription }) => {
                if (subscription.status === 'inactive') {
                  updateTeamSubscription(undefined)
                } else {
                  updateTeamSubscription(subscription)
                }

                setCancelling(false)
                openSettingsTab('teamUpgrade')
              })
              .catch((err) => {
                pushMessage({
                  title: 'Subscription Cancel Error',
                  description: err.message,
                })
                setCancelling(false)
              })
            return
          default:
            return
        }
      },
    })
  }, [
    setCancelling,
    subscription,
    updateTeamSubscription,
    pushMessage,
    messageBox,
    t,
    openSettingsTab,
  ])

  const reactivateCallback = useCallback(() => {
    if (subscription == null || subscription.status != 'canceled') {
      return
    }

    setActivating(true)
    reactivateSubscription(subscription.teamId, {})
      .then(({ subscription }) => {
        updateTeamSubscription(subscription)
        setActivating(false)
      })
      .catch((err) => {
        pushMessage({
          title: 'Subscription reactivation Error',
          description: err.message,
        })
        setActivating(false)
      })
  }, [setActivating, subscription, updateTeamSubscription, pushMessage])

  const onSuccessHandler = useCallback(
    (subscription: SerializedSubscription) => {
      updateTeamSubscription(subscription)
      setFormTab(undefined)
    },
    [updateTeamSubscription]
  )

  const onInvoiceHistory = useCallback(async () => {
    if (fetching || team == null) {
      return
    }
    try {
      setFetching(true)
      const data = await getTeamPortalUrl(team.id)
      window.open(data.url, '_blank')
    } catch (error) {
      pushAxiosErrorMessage(error)
    }

    setFetching(false)
  }, [fetching, team, pushAxiosErrorMessage])

  const applyCoupon = useCallback(async () => {
    if (
      subscription == null ||
      subscription.status === 'canceled' ||
      team == null
    ) {
      return
    }

    try {
      setApplyingPromo(true)
      await redeemPromo(team.id, { code: promoCode })
      pushMessage({
        title: 'Promo Code',
        description: `Applied promo code '${promoCode}' to your subscription`,
        type: 'success',
      })
    } catch (error) {
      if (error.response.status === 403) {
        pushMessage({
          type: 'error',
          title: 'Error',
          description: `Promo code ${promoCode} is not available for this account`,
        })
      } else {
        pushAxiosErrorMessage(error)
      }
    } finally {
      setApplyingPromo(false)
      setPromoCode('')
    }
  }, [promoCode, subscription, team, pushAxiosErrorMessage, pushMessage])

  const updateFormContent = useMemo(() => {
    if (formtab == null) {
      return null
    }

    switch (formtab) {
      case 'email':
        return (
          <UpdateBillingEmailForm
            sub={subscription}
            onSuccess={onSuccessHandler}
            onCancel={() => setFormTab(undefined)}
          />
        )
      case 'method':
        return (
          <Elements stripe={stripePromise}>
            <UpdateBillingMethodForm
              sub={subscription}
              onSuccess={onSuccessHandler}
              onCancel={() => setFormTab(undefined)}
            />
          </Elements>
        )
      default:
        return null
    }
  }, [formtab, subscription, onSuccessHandler])

  const currentUserPermissions = useMemo(() => {
    try {
      return permissions.filter(
        (permission) => permission.user.id === currentUser!.id
      )[0]
    } catch (error) {
      return undefined
    }
  }, [currentUser, permissions])

  if (team == null || currentUserPermissions == null) {
    return null
  }

  if (currentUserPermissions.role !== 'admin') {
    return (
      <Column>
        <Scrollable>
          <Section>
            <ColoredBlock variant='danger'>
              Only admins can access this content.
            </ColoredBlock>
          </Section>
        </Scrollable>
      </Column>
    )
  }

  if (subscription != null && subscription.status === 'trialing') {
    return (
      <Column>
        <Scrollable>
          <Section>
            <ColoredBlock variant='danger'>
              No active subscription. Your trial is underway
            </ColoredBlock>
          </Section>
        </Scrollable>
      </Column>
    )
  }

  if (updateFormContent != null) {
    return (
      <Column>
        <Scrollable>
          <Section>
            <StyledSmallFont>
              <TabHeader>{t('settings.teamSubscription')}</TabHeader>
              {updateFormContent}
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
            <TabHeader>{t('settings.teamSubscription')}</TabHeader>

            <StyledBillingContainer>
              {subscription != null && (
                <>
                  <SectionIntroduction>
                    {subscription.plan === 'pro' ? (
                      <SectionParagraph>
                        <StyledUpgradePlan>
                          <StyledCalcuration>
                            <span className='plan-name'>Pro</span>$
                            {stripeProPlanUnit} &times; {subscription.seats}{' '}
                            {plur('member', subscription.seats)} &times; 1 month
                          </StyledCalcuration>
                          <span>${subscription.seats * stripeProPlanUnit}</span>
                        </StyledUpgradePlan>
                        <StyledTotal>
                          <label>Total Monthly Price</label>
                          <strong>
                            ${subscription.seats * stripeProPlanUnit}
                          </strong>
                        </StyledTotal>
                      </SectionParagraph>
                    ) : subscription.plan === 'personal-pro' ? (
                      <SectionParagraph>
                        <SectionDescription style={{ marginBottom: '10px' }}>
                          Adding new members will automatically upgrade you to
                          the pro plan ($
                          {subscription.seats * stripeProPlanUnit} per member)
                        </SectionDescription>
                        <StyledUpgradePlan>
                          <StyledCalcuration>
                            <span className='plan-name'>Personal Pro</span>$
                            {stripePersonalProPlanUnit} &times; 1 member &times;
                            1 month
                          </StyledCalcuration>
                          <span>${stripePersonalProPlanUnit}</span>
                        </StyledUpgradePlan>
                        <StyledTotal>
                          <label>Due Today</label>
                          <strong>${stripePersonalProPlanUnit}</strong>
                        </StyledTotal>
                      </SectionParagraph>
                    ) : null}
                    <StyledBillingDescription>
                      {subscription.currentPeriodEnd !== 0 ? (
                        subscription.status === 'canceled' ? (
                          <p>
                            Your subscription will be canceled on{' '}
                            {getFormattedDateFromUnixTimestamp(
                              subscription.currentPeriodEnd
                            )}{' '}
                            upon reception of your last invoice .
                          </p>
                        ) : (
                          <p>
                            Will bill to the credit card ending in{' '}
                            <strong>{subscription.last4}</strong> at{' '}
                            <strong>
                              {getFormattedDateFromUnixTimestamp(
                                subscription.currentPeriodEnd
                              )}
                            </strong>
                            .{' '}
                            <StyledBillingLink
                              onClick={() => setFormTab('method')}
                            >
                              Edit Card
                            </StyledBillingLink>
                          </p>
                        )
                      ) : null}

                      <p>
                        Billing email is <strong>{subscription.email}</strong>.{' '}
                        <StyledBillingLink onClick={() => setFormTab('email')}>
                          Edit Billing Email
                        </StyledBillingLink>
                      </p>

                      <p>
                        You can see the{' '}
                        <StyledBillingLink
                          disabled={fetching}
                          onClick={onInvoiceHistory}
                        >
                          Billing History
                          {fetching ? (
                            <Spinner
                              style={{
                                position: 'relative',
                                left: 0,
                                top: 0,
                                transform: 'none',
                              }}
                            />
                          ) : (
                            <IconMdi path={mdiOpenInNew} />
                          )}
                        </StyledBillingLink>
                      </p>
                    </StyledBillingDescription>
                  </SectionIntroduction>

                  <Flexbox style={{ marginTop: '40px' }}>
                    {subscription.status !== 'canceled' ? (
                      <>
                        <CustomButton
                          variant='secondary'
                          onClick={cancellingCallback}
                          disabled={cancelling}
                        >
                          {cancelling ? (
                            <Spinner
                              style={{
                                position: 'relative',
                                left: 0,
                                top: 0,
                                transform: 'none',
                              }}
                            />
                          ) : (
                            'Cancel Subscription'
                          )}
                        </CustomButton>
                      </>
                    ) : (
                      <CustomButton
                        variant='primary'
                        onClick={reactivateCallback}
                        disabled={activating}
                      >
                        {activating ? (
                          <Spinner
                            style={{
                              position: 'relative',
                              left: 0,
                              top: 0,
                              transform: 'none',
                            }}
                          />
                        ) : (
                          'Reactivate your subscription'
                        )}
                      </CustomButton>
                    )}
                  </Flexbox>
                </>
              )}
              {subscription == null && (
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
                      onSuccess={(sub) => updateTeamSubscription(sub)}
                    />
                  </Elements>
                </SectionRow>
              )}
              <Section>
                <TabHeader>Promotions</TabHeader>
                <Flexbox justifyContent='space-between'>
                  <SectionInput
                    onChange={(ev: any) => setPromoCode(ev.target.value)}
                    value={promoCode}
                    style={{ maxWidth: '50%' }}
                    type='text'
                  />
                  <CustomButton
                    disabled={applyingPromo || promoCode.length === 0}
                    onClick={applyCoupon}
                  >
                    Apply Promotion Code
                  </CustomButton>
                </Flexbox>
              </Section>
            </StyledBillingContainer>
          </StyledSmallFont>
        </Section>
      </Scrollable>
    </Column>
  )
}

export default SubscriptionTab

const StyledBillingContainer = styled.div`
  width: 540px;
  margin-top: ${({ theme }) => theme.space.default}px;
`

const StyledBillingDescription = styled.div`
  margin-top: ${({ theme }) => theme.space.large}px;

  p {
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  }
`

const StyledBillingLink = styled.span`
  display: inline-flex;
  align-items: center;
  transition: 200ms color;
  color: ${({ theme }) => theme.primaryTextColor};

  &:hover,
  &:focus,
  &:active {
    cursor: pointer;
    text-decoration: underline;
  }

  svg {
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
  }
`

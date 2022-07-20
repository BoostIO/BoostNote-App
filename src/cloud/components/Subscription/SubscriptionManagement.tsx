import { mdiGiftOff, mdiOpenInNew } from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import Spinner from '../../../design/components/atoms/Spinner'
import { useToast } from '../../../design/lib/stores/toast'
import { cancelSubscription } from '../../api/teams/subscription'
import { getTeamPortalUrl } from '../../api/teams/subscription/invoices'
import { updateSubPlan } from '../../api/teams/subscription/update'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import { getFormattedDateFromUnixTimestamp } from '../../lib/date'
import { usePage } from '../../lib/stores/pageStore'
import { discountPlans, UpgradePlans } from '../../lib/stripe'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { SectionIntroduction } from '../settings/styled'
import Alert from '../../../components/atoms/Alert'
import SubscriptionCostSummary from './SubscriptionCostSummary'
import Banner from '../../../design/components/atoms/Banner'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import {
  newSpaceAnnualCouponId,
  newSpaceCouponId,
  newUserProCouponId,
  newUserStandardCouponId,
} from '../../lib/consts'
import { useElectron } from '../../lib/stores/electron'
import Icon from '../../../design/components/atoms/Icon'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import styled from '../../../design/lib/styled'
import SubscriptionPlanTables from './SubscriptionPlanTables'

interface SubscriptionManagementProps {
  subscription: SerializedSubscription
  onMethodClick: () => void
  onEmailClick: () => void
  onPromoClick: () => void
}

const SubscriptionManagement = ({
  subscription,
  onMethodClick,
  onEmailClick,
  onPromoClick,
}: SubscriptionManagementProps) => {
  const { translate } = useI18n()
  const [showPlanTables, setShowPlanTables] = useState(false)
  const [sending, setSending] = useState(false)
  const { updateTeamSubscription } = usePage()
  const { usingElectron, sendToElectron } = useElectron()
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(false)
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [targetedPlan, setTargetedPlan] = useState<
    'Free' | 'Standard' | 'Pro'
  >()

  const onInvoiceHistory = useCallback(async () => {
    if (fetchingHistory) {
      return
    }
    try {
      setFetchingHistory(true)
      const data = await getTeamPortalUrl(subscription.teamId)
      window.open(data.url, '_blank')
    } catch (error) {
      pushApiErrorMessage(error)
    }

    setFetchingHistory(false)
  }, [fetchingHistory, subscription.teamId, pushApiErrorMessage])

  const sendElectronEvent = useCallback(
    (subscription: SerializedSubscription, action: 'delete' | 'update') => {
      if (!usingElectron) {
        return
      }
      sendToElectron(`subscription-${action}`, subscription)
    },
    [usingElectron, sendToElectron]
  )

  const cancellingCallback = useCallback(() => {
    if (subscription.status === 'canceled') {
      return
    }
    setSending(true)
    cancelSubscription(subscription.teamId)
      .then(({ subscription }) => {
        if (subscription.status === 'inactive') {
          updateTeamSubscription(undefined)
          sendElectronEvent(subscription, 'delete')
        } else {
          updateTeamSubscription(subscription)
          sendElectronEvent(subscription, 'update')
        }

        setSending(false)
        setTargetedPlan(undefined)
      })
      .catch((err) => {
        pushMessage({
          title: 'Subscription Cancel Error',
          description: err.message,
        })
        setSending(false)
      })
  }, [
    subscription,
    updateTeamSubscription,
    pushMessage,
    setSending,
    sendElectronEvent,
  ])

  const updatingPlanCallback = useCallback(
    (plan: UpgradePlans) => {
      if (subscription.plan === plan) {
        return
      }
      setSending(true)
      updateSubPlan(subscription.teamId, { plan })
        .then(({ subscription }) => {
          updateTeamSubscription(subscription)
          sendElectronEvent(subscription, 'update')
          setSending(false)
          setTargetedPlan(undefined)
        })
        .catch((err) => {
          pushMessage({
            title: 'Subscription Cancel Error',
            description: err.message,
          })
          setSending(false)
        })
    },
    [
      subscription,
      updateTeamSubscription,
      pushMessage,
      setSending,
      sendElectronEvent,
    ]
  )

  const onChangePlanCallback = useCallback(() => {
    switch (targetedPlan) {
      case 'Free':
        return cancellingCallback()
      case 'Pro':
        return updatingPlanCallback('pro')
      case 'Standard':
        return updatingPlanCallback('standard')
      default:
        return
    }
  }, [targetedPlan, cancellingCallback, updatingPlanCallback])

  const subscriptionPlanChange =
    targetedPlan === 'Pro' ? 'Upgrade' : 'Downgrade'

  const usingJpyPricing = (subscription.cardBrand || '').toLowerCase() === 'jcb'

  const currentSubscriptionDiscount = useMemo(() => {
    if (subscription.couponId == null) {
      return
    }

    switch (subscription.couponId) {
      case newUserProCouponId:
        return discountPlans.newUserPro
      case newUserStandardCouponId:
        return discountPlans.newUserStandard
      case newSpaceCouponId:
        return discountPlans.newSpace
      case newSpaceAnnualCouponId:
        return discountPlans.newSpaceAnnual
      default:
        return discountPlans.migration
    }
  }, [subscription.couponId])

  return (
    <>
      <SectionIntroduction>
        {subscription.status === 'incomplete' && (
          <Alert variant='danger'>
            <h2>{translate(lngKeys.BillingActionRequired)}</h2>
            <p>{translate(lngKeys.BillingHistoryCheck)}</p>
            <Button
              onClick={onInvoiceHistory}
              disabled={fetchingHistory}
              className='subscription__management__warning'
            >
              {translate(lngKeys.BillingHistory)}
            </Button>
          </Alert>
        )}
        <SubscriptionCostSummary
          plan={subscription.plan}
          period={subscription.period}
          seats={subscription.seats}
          usingJpyPricing={usingJpyPricing}
          discount={currentSubscriptionDiscount}
        />
        {usingJpyPricing && (
          <Alert variant='secondary'>
            {translate(lngKeys.PaymentMethodJpy)}
          </Alert>
        )}
        <StyledBillingDescription>
          {subscription.currentPeriodEnd !== 0 ? (
            subscription.status === 'canceled' ? (
              <p>
                {translate(lngKeys.BillingCancelledAt, {
                  date: getFormattedDateFromUnixTimestamp(
                    subscription.currentPeriodEnd
                  ),
                })}
              </p>
            ) : (
              <p>
                {translate(lngKeys.BillingToCard, {
                  cardEnd: `${subscription.last4} ${
                    subscription.cardBrand != null
                      ? `(${subscription.cardBrand})`
                      : ''
                  }`,
                  date: getFormattedDateFromUnixTimestamp(
                    subscription.currentPeriodEnd
                  ),
                })}{' '}
                <StyledBillingButton disabled={sending} onClick={onMethodClick}>
                  {translate(lngKeys.BillingEditCard)}
                </StyledBillingButton>
              </p>
            )
          ) : null}

          <p>
            {translate(lngKeys.BillingEmail, {
              email: subscription.email,
            })}
            .{' '}
            <StyledBillingButton onClick={onEmailClick} disabled={sending}>
              {translate(lngKeys.BillingEditEmail)}
            </StyledBillingButton>
          </p>
          <p>
            {translate(lngKeys.BillingCanSeeThe)}
            <StyledBillingButton
              disabled={fetchingHistory}
              onClick={onInvoiceHistory}
            >
              {translate(lngKeys.BillingHistory)}
              {fetchingHistory ? (
                <Spinner
                  style={{
                    position: 'relative',
                    left: 0,
                    top: 0,
                    transform: 'none',
                  }}
                />
              ) : (
                <Icon path={mdiOpenInNew} />
              )}
            </StyledBillingButton>
          </p>
          <p>
            <StyledBillingButton onClick={onPromoClick} disabled={sending}>
              {translate(lngKeys.ApplyCoupon)}
            </StyledBillingButton>
          </p>
          <p>
            {showPlanTables ? (
              <StyledBillingButton
                disabled={fetchingHistory}
                onClick={() => setShowPlanTables(false)}
              >
                {translate(lngKeys.GeneralHideVerb)}
              </StyledBillingButton>
            ) : (
              <StyledBillingButton
                disabled={fetchingHistory}
                onClick={() => setShowPlanTables(true)}
              >
                {translate(lngKeys.BillingChangePlan)}
              </StyledBillingButton>
            )}
          </p>
        </StyledBillingDescription>
      </SectionIntroduction>
      {showPlanTables && (
        <SubscriptionPlanTables
          selectedPeriod={subscription.period}
          selectedPlan={subscription.plan}
          onCancel={() => setTargetedPlan('Free')}
          onStandardCallback={() => setTargetedPlan('Standard')}
          onProCallback={() => setTargetedPlan('Pro')}
        />
      )}
      {targetedPlan == null ? null : (
        <StyledPopup className='popup'>
          <div
            className='popup__background'
            onClick={() => {
              if (sending) {
                return
              }
              setTargetedPlan(undefined)
            }}
          />
          <div className='popup__container'>
            <Flexbox flex='1 1 auto' direction='column' alignItems='flex-start'>
              <h3>{subscriptionPlanChange}</h3>
              {subscription.couponId != null &&
                [
                  newUserStandardCouponId,
                  newUserProCouponId,
                  newSpaceCouponId,
                ].includes(subscription.couponId) && (
                  <Banner variant='warning' iconPath={mdiGiftOff}>
                    {translate(lngKeys.BillingChangePlanDiscountStop)}
                  </Banner>
                )}
              {targetedPlan === 'Free' ? (
                <>
                  <p>{translate(lngKeys.BillingChangePlanFreeDisclaimer)}</p>
                  <p>{translate(lngKeys.GeneralDoYouWishToProceed)}</p>
                </>
              ) : targetedPlan === 'Pro' ? (
                <>
                  <p>{translate(lngKeys.BillingChangePlanProDisclaimer)}</p>
                  <div className='cost__separator' />
                  <p>
                    {translate(
                      lngKeys.BillingChangePlanStripeProrationUpgradeDiscount
                    )}
                    <br />
                    <span>
                      {translate(lngKeys.BillingChangePlanStripeProration)}
                      <a
                        href='https://stripe.com/docs/billing/subscriptions/prorations'
                        target='__blank'
                        rel='noreferrer'
                        style={{ marginLeft: 3 }}
                      >
                        {translate(lngKeys.GeneralLearnMore)}
                        <Icon path={mdiOpenInNew} />
                      </a>
                    </span>
                  </p>
                  <SubscriptionCostSummary
                    className='popup__billing'
                    seats={subscription.seats}
                    period={subscription.period}
                    plan={'pro'}
                    usingJpyPricing={usingJpyPricing}
                  />
                </>
              ) : (
                <>
                  <p>
                    {translate(lngKeys.BillingChangePlanStandardDisclaimer)}
                  </p>
                  <div className='cost__separator' />
                  <p>
                    {translate(
                      lngKeys.BillingChangePlanStripeProrationDowngradeDiscount
                    )}
                    <br />
                    <span>
                      {translate(lngKeys.BillingChangePlanStripeProration)}
                      <a
                        href='https://stripe.com/docs/billing/subscriptions/prorations'
                        target='__blank'
                        rel='noreferrer'
                        style={{ marginLeft: 3 }}
                      >
                        {translate(lngKeys.GeneralLearnMore)}
                        <Icon path={mdiOpenInNew} />
                      </a>
                    </span>
                  </p>

                  <SubscriptionCostSummary
                    className='popup__billing'
                    seats={subscription.seats}
                    period={subscription.period}
                    plan={'standard'}
                    usingJpyPricing={usingJpyPricing}
                  />
                </>
              )}
            </Flexbox>
            <Flexbox
              flex='0 0 auto'
              direction='column'
              className='button__group'
            >
              <LoadingButton
                variant='primary'
                className='btn'
                disabled={sending}
                onClick={onChangePlanCallback}
                type='button'
                spinning={sending}
              >
                {subscriptionPlanChange}
              </LoadingButton>
              <Button
                variant='bordered'
                className='btn'
                onClick={() => setTargetedPlan(undefined)}
                disabled={sending}
                type='button'
              >
                {translate(lngKeys.GeneralCancel)}
              </Button>
            </Flexbox>
          </div>
        </StyledPopup>
      )}
    </>
  )
}

const StyledPopup = styled.div`
  z-index: 8010;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  font-size: 13px;

  .cost__separator {
    margin: ${({ theme }) => theme.sizes.spaces.xsm}px;
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.colors.background.quaternary};
  }

  .button__group {
    button {
      margin: 0;
    }

    button + button {
      margin-top: 8px;
    }
  }

  .popup__background {
    z-index: 8011;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000;
    opacity: 0.7;
  }

  .popup__container {
    z-index: 8012;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${({ theme }) => theme.sizes.spaces.md}px
      ${({ theme }) => theme.sizes.spaces.l}px;
    position: relative;
    max-width: 80vw;
    max-height: 80vh;
    width: 600px;
    min-height: 400px;
    height: auto;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
    border-radius: 4px;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    line-height: 1.6;
    overflow: auto;

    .btn {
      width: 100%;
      margin-left: 0;
      &:first-of-type {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
      }
    }

    h3 {
      font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    }

    a {
      display: inline-flex;
      align-items: center;
      transition: 200ms color;
      text-decoration: none;
      color: ${({ theme }) => theme.colors.text.link};

      &:hover,
      &:focus,
      &:active {
        cursor: pointer;
        text-decoration: underline;
      }

      svg {
        margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      }
    }
  }

  .popup__billing {
    width: 100%;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
  }
`

const StyledBillingDescription = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.l}px;

  p {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

const StyledBillingButton = styled.button`
  display: inline-flex;
  align-items: center;
  transition: 200ms color;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.link};

  &:hover,
  &:focus,
  &:active {
    text-decoration: underline;
  }

  svg {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default SubscriptionManagement

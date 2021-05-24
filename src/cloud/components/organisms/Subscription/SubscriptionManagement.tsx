import { mdiOpenInNew } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import Icon from '../../../../components/atoms/Icon'
import Spinner from '../../../../components/atoms/Spinner'
import { useToast } from '../../../../shared/lib/stores/toast'
import { cancelSubscription } from '../../../api/teams/subscription'
import { getTeamPortalUrl } from '../../../api/teams/subscription/invoices'
import { updateSubPlan } from '../../../api/teams/subscription/update'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getFormattedDateFromUnixTimestamp } from '../../../lib/date'
import { usePage } from '../../../lib/stores/pageStore'
import { UpgradePlans } from '../../../lib/stripe'
import styled from '../../../lib/styled'
import Button from '../../atoms/Button'
import Flexbox from '../../atoms/Flexbox'
import { SectionIntroduction } from '../settings/styled'
import PlanTables from './PlanTables'
import Alert from '../../../../components/atoms/Alert'
import SubscriptionCostSummary from './SubscriptionCostSummary'

interface SubscriptionManagementProps {
  subscription: SerializedSubscription
  team: SerializedTeam
  onMethodClick: () => void
  onEmailClick: () => void
  onPromoClick: () => void
}

const SubscriptionManagement = ({
  subscription,
  team,
  onMethodClick,
  onEmailClick,
  onPromoClick,
}: SubscriptionManagementProps) => {
  const [showPlanTables, setShowPlanTables] = useState(false)
  const [sending, setSending] = useState(false)
  const { updateTeamSubscription } = usePage()
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

  const cancellingCallback = useCallback(() => {
    if (subscription.status === 'canceled') {
      return
    }
    setSending(true)
    cancelSubscription(subscription.teamId)
      .then(({ subscription }) => {
        if (subscription.status === 'inactive') {
          updateTeamSubscription(undefined)
        } else {
          updateTeamSubscription(subscription)
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
  }, [subscription, updateTeamSubscription, pushMessage, setSending])

  const updatingPlanCallback = useCallback(
    (plan: UpgradePlans) => {
      if (subscription.plan === plan) {
        return
      }
      setSending(true)
      updateSubPlan(subscription.teamId, { plan })
        .then(({ subscription }) => {
          updateTeamSubscription(subscription)
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
    [subscription, updateTeamSubscription, pushMessage, setSending]
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
  console.log(subscription)
  return (
    <>
      <SectionIntroduction>
        <SubscriptionCostSummary
          plan={subscription.plan}
          seats={subscription.seats}
          usingJpyPricing={usingJpyPricing}
          discounted={subscription.discountId != null}
        />
        {usingJpyPricing && (
          <Alert variant='secondary'>
            We can only accept JPY(Japanese Yen) when paying by JCB cards.
          </Alert>
        )}
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
                <strong>
                  {subscription.last4}
                  {subscription.cardBrand != null &&
                    ` (${subscription.cardBrand})`}
                </strong>{' '}
                at{' '}
                <strong>
                  {getFormattedDateFromUnixTimestamp(
                    subscription.currentPeriodEnd
                  )}
                </strong>
                .{' '}
                <StyledBillingButton disabled={sending} onClick={onMethodClick}>
                  Edit Card
                </StyledBillingButton>
              </p>
            )
          ) : null}

          <p>
            Billing email is <strong>{subscription.email}</strong>.{' '}
            <StyledBillingButton onClick={onEmailClick} disabled={sending}>
              Edit Billing Email
            </StyledBillingButton>
          </p>
          <p>
            You can see the{' '}
            <StyledBillingButton
              disabled={fetchingHistory}
              onClick={onInvoiceHistory}
            >
              Billing History
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
              Apply a coupon
            </StyledBillingButton>
          </p>
          <p>
            {showPlanTables ? (
              <StyledBillingButton
                disabled={fetchingHistory}
                onClick={() => setShowPlanTables(false)}
              >
                Hide
              </StyledBillingButton>
            ) : (
              <StyledBillingButton
                disabled={fetchingHistory}
                onClick={() => setShowPlanTables(true)}
              >
                Change plans
              </StyledBillingButton>
            )}
          </p>
        </StyledBillingDescription>
      </SectionIntroduction>
      {showPlanTables && (
        <PlanTables
          selectedPlan={subscription.plan}
          team={team}
          onFreeCallback={() => setTargetedPlan('Free')}
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
              <h3>
                {subscriptionPlanChange} to {targetedPlan}
              </h3>
              {targetedPlan === 'Free' ? (
                <>
                  <p>
                    You will lose access immediately to advanced features such
                    as unlimited documents, document revision history, bigger
                    storage size etc...
                  </p>
                  <p>Do you wish to downgrade nonetheless?</p>
                </>
              ) : targetedPlan === 'Pro' ? (
                <>
                  <p>
                    You will get access to advanced features such as unlimited
                    document revision history, setting password and expiration
                    date for shared documents, guest invitations etc...
                  </p>
                  <p>
                    The fee change is handled via Stripe&apos;s proration.
                    <a
                      href='https://stripe.com/docs/billing/subscriptions/prorations'
                      target='__blank'
                      rel='noreferrer'
                    >
                      Learn more
                      <Icon path={mdiOpenInNew} />
                    </a>
                  </p>
                  <SubscriptionCostSummary
                    className='popup__billing'
                    seats={subscription.seats}
                    plan={'pro'}
                    discounted={subscription.discountId != null}
                    usingJpyPricing={usingJpyPricing}
                  />
                </>
              ) : (
                <>
                  <p>
                    You will lose access to advanced features such as unlimited
                    document revision history, setting password and expiration
                    date for shared document, guest invitation, etc...
                  </p>
                  <p>
                    The fee change is handled via Stripe&apos;s proration.
                    <a
                      href='https://stripe.com/docs/billing/subscriptions/prorations'
                      target='__blank'
                      rel='noreferrer'
                    >
                      Learn more
                      <Icon path={mdiOpenInNew} />
                    </a>
                  </p>
                  <SubscriptionCostSummary
                    className='popup__billing'
                    seats={subscription.seats}
                    plan={'standard'}
                    discounted={subscription.discountId != null}
                    usingJpyPricing={usingJpyPricing}
                  />
                </>
              )}
            </Flexbox>
            <Flexbox flex='0 0 auto' direction='column'>
              <Button
                variant='primary'
                className='btn'
                disabled={sending}
                onClick={onChangePlanCallback}
                type='button'
              >
                {sending ? (
                  <Spinner className='relative spinner' />
                ) : (
                  subscriptionPlanChange
                )}
              </Button>
              <Button
                variant='outline-secondary'
                className='btn'
                onClick={() => setTargetedPlan(undefined)}
                disabled={sending}
                type='button'
              >
                Cancel
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

  .popup__background {
    z-index: 8011;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.blackBackgroundColor};
    opacity: 0.7;
  }

  .popup__container {
    z-index: 8012;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${({ theme }) => theme.space.medium}px
      ${({ theme }) => theme.space.large}px;
    position: relative;
    max-width: 80vw;
    max-height: 80vh;
    width: 600px;
    min-height: 400px;
    height: auto;
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    box-shadow: ${({ theme }) => theme.baseShadowColor};
    border-radius: 4px;
    overflow: auto;

    .btn {
      width: 100%;
      margin-left: 0;
      &:first-of-type {
        margin-bottom: ${({ theme }) => theme.space.xsmall}px;
      }
    }

    .spinner {
      border-color: ${({ theme }) => theme.whiteBorderColor};
      border-right-color: transparent;
    }

    a {
      display: inline-flex;
      align-items: center;
      transition: 200ms color;
      text-decoration: none;
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
    }
  }

  .popup__billing {
    width: 100%;
  }
`

const StyledBillingDescription = styled.div`
  margin-top: ${({ theme }) => theme.space.large}px;

  p {
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;
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
  color: ${({ theme }) => theme.primaryTextColor};

  &:hover,
  &:focus,
  &:active {
    text-decoration: underline;
  }

  svg {
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
  }
`

export default SubscriptionManagement

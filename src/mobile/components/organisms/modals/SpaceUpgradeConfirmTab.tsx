import React, { useCallback } from 'react'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../../cloud/interfaces/pageStore'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import SubscriptionForm from '../../../../cloud/components/SubscriptionForm'
import { stripePublishableKey } from '../../../../cloud/lib/consts'
import { UpgradePlans } from '../../../../cloud/lib/stripe'
import styled from '../../../../design/lib/styled'
import Banner from '../../../../design/components/atoms/Banner'
import { SettingsTabTypes } from './types'
import NavigationBarButton from '../../atoms/NavigationBarButton'
import ModalContainer from './atoms/ModalContainer'
import Icon from '../../../../design/components/atoms/Icon'
import { mdiArrowLeft } from '@mdi/js'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'

const stripePromise = loadStripe(stripePublishableKey)

interface SpaqceUpgradeConfirmTabProps {
  plan: UpgradePlans | null
  setActiveTab: (tab: SettingsTabTypes | null) => void
}

const UpgradeTab = ({ plan, setActiveTab }: SpaqceUpgradeConfirmTabProps) => {
  const { team, subscription, updateTeamSubscription, currentUserPermissions } =
    usePage<PageStoreWithTeam>()

  const onSuccessCallback = useCallback(
    (sub) => {
      updateTeamSubscription(sub)
    },
    [updateTeamSubscription]
  )

  if (
    team == null ||
    (subscription != null && subscription.status === 'active') ||
    currentUserPermissions == null
  ) {
    return null
  }

  if (
    currentUserPermissions == null ||
    currentUserPermissions.role !== 'admin'
  ) {
    return (
      <Container>
        <Banner variant='danger'>Only Admin can change plan</Banner>
      </Container>
    )
  }

  return (
    <ModalContainer
      left={
        <NavigationBarButton onClick={() => setActiveTab(null)}>
          <Icon size={20} path={mdiArrowLeft} /> Back
        </NavigationBarButton>
      }
      title='Members'
      closeLabel='Done'
    >
      <Container>
        {currentUserPermissions.role !== 'admin' ? (
          <ColoredBlock variant='danger'>
            Only admins can access this content.
          </ColoredBlock>
        ) : (
          !(subscription != null && subscription.status === 'active') && (
            <Elements stripe={stripePromise}>
              <SubscriptionForm
                team={team}
                initialPlan={plan || undefined}
                ongoingTrial={
                  subscription != null && subscription.status === 'trialing'
                }
                onSuccess={onSuccessCallback}
                onCancel={() => setActiveTab('space-upgrade')}
              />
            </Elements>
          )
        )}
      </Container>
    </ModalContainer>
  )
}

export default UpgradeTab

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.sm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
`

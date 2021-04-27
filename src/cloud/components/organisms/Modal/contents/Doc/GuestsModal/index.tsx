import React from 'react'
import { ModalContainer } from '../../styled'
import { usePage } from '../../../../../../lib/stores/pageStore'
import { mdiArrowRight, mdiBackupRestore } from '@mdi/js'
import CustomButton from '../../../../../atoms/buttons/CustomButton'
import { useSettings } from '../../../../../../lib/stores/settings'
import styled from '../../../../../../lib/styled'
import Icon from '../../../../../atoms/Icon'
import { guestsPerMember } from '../../../../../../lib/subscription'
import plur from 'plur'
import GuestInvitesSection from '../../../../../molecules/GuestInvitesSection'
import { PrimaryAnchor } from '../../../../settings/styled'
import { useModal } from '../../../../../../../shared/lib/stores/modal'

interface GuestsModalProps {
  docId: string
  teamId: string
}

const GuestsModal = ({ docId, teamId }: GuestsModalProps) => {
  const { subscription, permissions = [], guestsMap } = usePage()
  const { closeLastModal: closeModal } = useModal()
  const { openSettingsTab } = useSettings()

  if (subscription == null || subscription.plan === 'standard') {
    return (
      <ModalContainer style={{ padding: 0 }}>
        <NonSubContent>
          <Icon path={mdiBackupRestore} size={60} className='icon' />
          <p>
            Let&apos;s upgrade to the Pro plan now and invite outside
            collaborators to this document.
            <br />
          </p>
          <CustomButton
            variant='primary'
            onClick={() => {
              if (subscription == null) {
                openSettingsTab('teamUpgrade')
              } else {
                openSettingsTab('teamSubscription')
              }
              closeModal()
            }}
          >
            Upgrade
          </CustomButton>
        </NonSubContent>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer>
      <Container>
        <h2>Invite outside guests to this document</h2>
        <p>
          Guests are outsiders who you want to work with on specific documents.
          They can be invited to individual documents but not entire workspaces.
        </p>
        <p>
          {permissions.length > 0
            ? `${
                permissions.length * guestsPerMember - guestsMap.size
              } remaining ${plur('seat', permissions.length)}. `
            : 'No Remaining seats. '}
          <PrimaryAnchor
            target='_blank'
            rel='noreferrer'
            href='https://intercom.help/boostnote-for-teams/en/articles/4874279-how-to-invite-guest-to-your-document'
          >
            See how it works <Icon path={mdiArrowRight} />
          </PrimaryAnchor>
        </p>
        <GuestInvitesSection teamId={teamId} docId={docId} />
      </Container>
    </ModalContainer>
  )
}

const NonSubContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 80%;
  margin: auto;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.baseTextColor};
  p {
    text-align: center;
  }
  svg {
    color: ${({ theme }) => theme.secondaryBackgroundColor};
  }
  .icon {
    margin-bottom: 20px;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export default GuestsModal

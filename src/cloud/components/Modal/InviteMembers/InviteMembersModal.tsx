import React, { useEffect, useRef } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useI18n } from '../../../lib/hooks/useI18n'
import SettingTabContent from '../../../../design/components/organisms/Settings/atoms/SettingTabContent'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import styled from '../../../../design/lib/styled'
import OpenInvitesSection from '../../OpenInviteSection'
import InviteMemberModalSection from './InviteMemberModalSection'

const InviteMembersModal = () => {
  const { team, currentUserPermissions } = usePage()
  const { subscription } = usePage()
  const mountedRef = useRef(false)
  const { translate } = useI18n()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (currentUserPermissions == null || team == null) {
    return (
      <SettingTabContent
        title={translate('settings.teamMembers')}
        body={
          <ColoredBlock variant='danger'>
            You don&apos;t own any permissions.
          </ColoredBlock>
        }
      />
    )
  }

  return (
    <SettingTabContent
      title={
        <OpenInviteTitle>Invite members to {team.name}</OpenInviteTitle>
      }
      body={
        <>
          <OpenInvitesSection userPermissions={currentUserPermissions} />
          <InviteMemberModalSection
            userPermissions={currentUserPermissions}
            subscription={subscription}
          />
        </>
      }
    />
  )
}

const OpenInviteTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
`


export default InviteMembersModal

import React, { useState, useEffect, useRef } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { TeamPermissionType } from '../../interfaces/db/userTeamPermissions'
import { useI18n } from '../../lib/hooks/useI18n'
import SettingTabContent from '../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import ColoredBlock from '../atoms/ColoredBlock'
import SettingTabSelector from '../../../shared/components/organisms/Settings/atoms/SettingTabSelector'
import cc from 'classcat'
import OpenInvitesSection from './OpenInviteSection'
import InviteMemberModalSection from './InviteMembers/InviteMemberModalSection'

const InviteMembersModal = () => {
  const { team, currentUserPermissions } = usePage()
  const [tab, setTab] = useState<TeamPermissionType>('member')
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
        <SettingTabSelector>
          <button
            className={cc([tab === 'member' && 'active'])}
            onClick={() => setTab('member')}
          >
            Invite members to <i>{team.name}</i>
          </button>
        </SettingTabSelector>
      }
      description={
        'Invite your teammates to Boost Note to start collaboration!'
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

export default InviteMembersModal

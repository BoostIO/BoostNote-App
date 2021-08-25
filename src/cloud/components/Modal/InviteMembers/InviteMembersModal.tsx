import React, { useState, useEffect, useRef } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { TeamPermissionType } from '../../../interfaces/db/userTeamPermissions'
import { useI18n } from '../../../lib/hooks/useI18n'
import cc from 'classcat'
import SettingTabContent from '../../../../design/components/organisms/Settings/atoms/SettingTabContent'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import SettingTabSelector from '../../../../design/components/organisms/Settings/atoms/SettingTabSelector'
import OpenInvitesSection from '../../OpenInviteSection'
import InviteMemberModalSection from './InviteMemberModalSection'

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
        'Invite your teammates to Boost Note to start collaborating!'
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

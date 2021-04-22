import React, { useState, useCallback } from 'react'
import {
  Section,
  SectionHeader2,
  SectionRow,
  SectionInput,
  SectionList,
  SectionListItem,
  SectionInLineIcon,
  SectionSelect,
} from '../organisms/settings/styled'
import { SerializedTeamInvite } from '../../interfaces/db/teamInvite'
import { useDialog, DialogIconTypes } from '../../../shared/lib/stores/dialog'
import { usePage } from '../../lib/stores/pageStore'
import { useEffectOnce } from 'react-use'
import {
  getTeamInvites,
  createTeamInvite,
  cancelTeamInvite,
} from '../../api/teams/invites'
import { TeamPermissionType } from '../../interfaces/db/userTeamPermissions'
import IconMdi from '../atoms/IconMdi'
import { mdiClose } from '@mdi/js'
import { Spinner } from '../atoms/Spinner'
import ErrorBlock from '../atoms/ErrorBlock'
import CustomButton from '../atoms/buttons/CustomButton'
import { SelectChangeEventHandler } from '../../lib/utils/events'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import Flexbox from '../atoms/Flexbox'

interface TeamInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
}

const TeamInvitesSection = ({ userPermissions }: TeamInvitesSectionProps) => {
  const { team } = usePage()
  const [sending, setSending] = useState<boolean>(true)
  const [pendingInvites, setPendingInvites] = useState<SerializedTeamInvite[]>(
    []
  )
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<unknown>()
  const { messageBox } = useDialog()
  const [role, setRole] = useState<TeamPermissionType>('member')

  useEffectOnce(() => {
    fetchAndSetInvites()
  })

  const fetchAndSetInvites = useCallback(async () => {
    if (team == null) {
      return
    }
    setSending(true)
    try {
      const { invites } = await getTeamInvites(team)
      setPendingInvites(invites)
    } catch (error) {
      setError(error)
    }
    setSending(false)
  }, [team])

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value)
    },
    [setEmail]
  )

  const submitInvite = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (team == null) {
        return
      }

      setError(undefined)
      setSending(true)
      try {
        const { invite } = await createTeamInvite(team, { email, role })
        setPendingInvites((pendingInvites) => {
          return [...pendingInvites, invite]
        })
        setEmail('')
      } catch (error) {
        setError(error)
      }
      setSending(false)
    },
    [team, email, role]
  )

  const cancelInvite = useCallback(
    async (invite: SerializedTeamInvite) => {
      if (team == null) {
        return
      }

      messageBox({
        title: `Cancel?`,
        message: `Are you sure to retract this invite? The user won't be able to join the team anymore.`,
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Delete',
            onClick: async () => {
              //remove
              try {
                await cancelTeamInvite(team, invite)
                setPendingInvites((pendingInvites) => {
                  return pendingInvites.filter(
                    (pendingInvite) => pendingInvite.id !== invite.id
                  )
                })
              } catch (error) {
                setError(error)
              }
              return
            },
          },
        ],
      })
    },
    [messageBox, team]
  )

  const selectRole: SelectChangeEventHandler = useCallback(
    (event) => {
      if (userPermissions.role !== 'admin') {
        return
      }

      setRole(event.target.value as TeamPermissionType)
    },
    [setRole, userPermissions]
  )

  return (
    <Section>
      <Flexbox>
        <SectionHeader2>Invite with Email</SectionHeader2>
        {sending && <Spinner className='relative' style={{ top: 2 }} />}
      </Flexbox>
      <form onSubmit={submitInvite}>
        <SectionRow>
          <SectionInput
            value={email}
            onChange={onChangeHandler}
            placeholder='Email...'
          />
          <SectionSelect
            value={role}
            onChange={selectRole}
            style={{ width: 'auto', minWidth: 'initial', marginRight: 16 }}
            disabled={userPermissions.role !== 'admin'}
          >
            <option value='admin'>admin</option>
            <option value='member'>member</option>
          </SectionSelect>
          <CustomButton type='submit' variant='primary'>
            Send
          </CustomButton>
        </SectionRow>
      </form>
      {role === 'admin' ? (
        <small>
          Admins can handle billing, remove or promote/demote members.
        </small>
      ) : (
        <small>
          Members can access all features, except team management, billing.
        </small>
      )}
      <SectionList>
        {pendingInvites.map((invite) => (
          <SectionListItem key={invite.id} className='li'>
            <label>{invite.email}</label>
            <div>
              {invite.role}{' '}
              <SectionInLineIcon onClick={() => cancelInvite(invite)}>
                <IconMdi path={mdiClose} />
              </SectionInLineIcon>
            </div>
          </SectionListItem>
        ))}
      </SectionList>
      {error != null && <ErrorBlock error={error} />}
    </Section>
  )
}

export default TeamInvitesSection

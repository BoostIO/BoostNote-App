import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  SectionList,
  SectionListItem,
  SectionInLineIcon,
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
import { mdiClose, mdiOpenInNew } from '@mdi/js'
import { Spinner } from '../atoms/Spinner'
import ErrorBlock from '../atoms/ErrorBlock'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import Flexbox from '../atoms/Flexbox'
import Form from '../../../shared/components/molecules/Form'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import FormRow from '../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../shared/components/molecules/Form/templates/FormRowItem'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { FormSelectOption } from '../../../shared/components/molecules/Form/atoms/FormSelect'
import { ExternalLink } from '../../../shared/components/atoms/Link'
import Icon from '../../../shared/components/atoms/Icon'
import styled from '../../../shared/lib/styled'
import { useMediaQuery } from 'react-responsive'
import commonTheme from '../../../shared/lib/styled/common'

interface TeamInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
  subscription?: SerializedSubscription
}

const TeamInvitesSection = ({
  userPermissions,
  subscription,
}: TeamInvitesSectionProps) => {
  const { team } = usePage()
  const [sending, setSending] = useState<boolean>(true)
  const [pendingInvites, setPendingInvites] = useState<SerializedTeamInvite[]>(
    []
  )
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<unknown>()
  const { messageBox } = useDialog()
  const [role, setRole] = useState<TeamPermissionType>(
    userPermissions.role === 'viewer'
      ? 'viewer'
      : subscription != null
      ? 'member'
      : 'viewer'
  )
  const mountedRef = useRef(false)
  const { translate, getRoleLabel } = useI18n()
  const isSmallScreen = useMediaQuery({
    maxWidth: commonTheme.breakpoints.mobile,
  })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffectOnce(() => {
    fetchAndSetInvites()
  })

  const fetchAndSetInvites = useCallback(async () => {
    if (team == null) {
      return
    }
    setSending(true)
    getTeamInvites(team)
      .then(({ invites }) => {
        if (!mountedRef.current) {
          return
        }
        setPendingInvites(invites)
      })
      .catch((error) => {
        if (!mountedRef.current) {
          return
        }
        setError(error)
      })
      .finally(() => {
        if (!mountedRef.current) {
          return
        }
        setSending(false)
      })
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
        title: translate(lngKeys.CancelInvite),
        message: translate(lngKeys.CancelInviteEmailMessage),
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
    [messageBox, team, translate]
  )

  const selectRole = useCallback(
    (option: FormSelectOption) => {
      if (userPermissions.role !== 'admin') {
        return
      }

      setRole(option.value as TeamPermissionType)
    },
    [setRole, userPermissions]
  )

  const selectRoleOptions = useMemo(() => {
    let roles: FormSelectOption[] = []

    if (subscription == null) {
      return [{ label: translate(lngKeys.GeneralViewer), value: 'viewer' }]
    }

    switch (userPermissions.role) {
      case 'admin':
        roles = [
          { label: translate(lngKeys.GeneralAdmin), value: 'admin' },
          { label: translate(lngKeys.GeneralMember), value: 'member' },
        ]
        break
      case 'member':
        roles = [{ label: translate(lngKeys.GeneralMember), value: 'member' }]
        break
      case 'viewer':
      default:
        break
    }

    roles.push({ label: translate(lngKeys.GeneralViewer), value: 'viewer' })
    return roles
  }, [userPermissions.role, subscription, translate])

  return (
    <Container>
      <Flexbox>
        <h2>{translate(lngKeys.InviteEmail)}</h2>
        {sending && <Spinner className='relative' style={{ top: 2 }} />}
      </Flexbox>
      <Form onSubmit={submitInvite}>
        {!isSmallScreen ? (
          <FormRow fullWidth={true}>
            <FormRowItem
              item={{
                type: 'input',
                props: {
                  value: email,
                  onChange: onChangeHandler,
                  placeholder: 'Email...',
                },
              }}
            />
            <FormRowItem
              flex='0 0 150px'
              item={{
                type: 'select',
                props: {
                  value: { label: getRoleLabel(role), value: role },
                  onChange: selectRole,
                  options: selectRoleOptions,
                },
              }}
            />
            <FormRowItem
              flex='0 0 100px !important'
              item={{
                type: 'button',
                props: {
                  type: 'submit',
                  label: translate(lngKeys.GeneralSendVerb),
                  disabled: sending,
                },
              }}
            />
          </FormRow>
        ) : (
          <>
            <FormRow fullWidth={true}>
              <FormRowItem
                item={{
                  type: 'input',
                  props: {
                    value: email,
                    onChange: onChangeHandler,
                    placeholder: 'Email...',
                  },
                }}
              />
              <FormRowItem
                flex='0 0 150px'
                item={{
                  type: 'select',
                  props: {
                    value: { label: getRoleLabel(role), value: role },
                    onChange: selectRole,
                    options: selectRoleOptions,
                  },
                }}
              />
            </FormRow>
            <FormRow fullWidth={true}>
              <FormRowItem
                flex='0 0 100px !important'
                item={{
                  type: 'button',
                  props: {
                    type: 'submit',
                    label: translate(lngKeys.GeneralSendVerb),
                    disabled: sending,
                  },
                }}
              />
            </FormRow>
          </>
        )}
      </Form>
      <small>
        {role === 'admin'
          ? translate(lngKeys.RoleAdminDescription)
          : role === 'member'
          ? translate(lngKeys.RoleMemberDescription)
          : translate(lngKeys.RoleViewerDescription)}
        <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'>
          {translate(lngKeys.SeeRoleDetails)}
          <Icon path={mdiOpenInNew} size={12} />
        </ExternalLink>
      </small>
      <SectionList>
        {pendingInvites.map((invite) => (
          <SectionListItem key={invite.id} className='li'>
            <label>{invite.email}</label>
            <div>
              {getRoleLabel(invite.role as TeamPermissionType)}{' '}
              {(invite.role === userPermissions.role ||
                userPermissions.role !== 'viewer') && (
                <SectionInLineIcon onClick={() => cancelInvite(invite)}>
                  <IconMdi path={mdiClose} />
                </SectionInLineIcon>
              )}
            </div>
          </SectionListItem>
        ))}
      </SectionList>
      {error != null && <ErrorBlock error={error} />}
    </Container>
  )
}

const Container = styled.section`
  small {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    display: block;
  }

  small a {
    display: inline-flex;
    white-space: nowrap;
    &:hover {
      svg {
        text-decoration: underline;
      }
    }
  }
`

export default TeamInvitesSection

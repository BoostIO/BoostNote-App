import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { createTeamInvite } from '../../../api/teams/invites'
import {
  SerializedUserTeamPermissions,
  TeamPermissionType,
} from '../../../interfaces/db/userTeamPermissions'
import { mdiHelpCircleOutline, mdiPlus } from '@mdi/js'
import { Spinner } from '../../atoms/Spinner'
import ErrorBlock from '../../atoms/ErrorBlock'
import Flexbox from '../../atoms/Flexbox'
import Form from '../../../../shared/components/molecules/Form'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import FormRow from '../../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../shared/components/molecules/Form/templates/FormRowItem'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { FormSelectOption } from '../../../../shared/components/molecules/Form/atoms/FormSelect'
import styled from '../../../../shared/lib/styled'
import HelpLink from '../Help/HelpLink'

interface TeamInvitesSectionProps {
  userPermissions: SerializedUserTeamPermissions
  subscription?: SerializedSubscription
}

interface EmailData {
  email: string
  role: TeamPermissionType
}

const InviteMemberModalSection = ({
  userPermissions,
  subscription,
}: TeamInvitesSectionProps) => {
  const { team } = usePage()
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const [role] = useState<TeamPermissionType>(
    userPermissions.role === 'viewer'
      ? 'viewer'
      : subscription != null
      ? 'member'
      : 'viewer'
  )
  const [emailsToInvite, setEmailsToInvite] = useState<EmailData[]>([
    { email: '', role: role },
  ])

  const mountedRef = useRef(false)
  const { translate, getRoleLabel } = useI18n()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, emailIdx) => {
      const newEmailList = emailsToInvite.map((item, idx) => {
        if (idx === emailIdx) {
          return {
            ...item,
            email: event.target.value,
          }
        }
        return item
      })
      setEmailsToInvite(newEmailList)
    },
    [emailsToInvite]
  )

  const isEmailDataCorrect = useCallback((emailData: EmailData) => {
    return emailData.email != ''
  }, [])

  const submitInvites = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (team == null) {
        return
      }

      setError(undefined)
      setSending(true)
      try {
        let failedInvites = 0
        for (const email of emailsToInvite) {
          if (isEmailDataCorrect(email)) {
            await createTeamInvite(team, email)
          } else {
            failedInvites += 1
          }
        }
        if (failedInvites === emailsToInvite.length) {
          setError(translate(lngKeys.InviteFailError))
        } else {
          setEmailsToInvite([{ email: '', role: role }])
        }
      } catch (error) {
        console.warn(error)
        setError(error)
      }
      setSending(false)
    },
    [team, emailsToInvite, role, isEmailDataCorrect, translate]
  )

  const selectRole = useCallback(
    (option: FormSelectOption, emailIdx: number) => {
      if (userPermissions.role !== 'admin') {
        return
      }

      const newEmailList = emailsToInvite.map((item, idx) => {
        if (idx === emailIdx) {
          return {
            ...item,
            role: option.value as TeamPermissionType,
          }
        }
        return item
      })
      setEmailsToInvite(newEmailList)
    },
    [emailsToInvite, userPermissions.role]
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

  const addMemberForm = useCallback(() => {
    setEmailsToInvite((prev) => {
      return [...prev, { email: '', role: role }]
    })
  }, [role])

  return (
    <Container>
      <Flexbox>
        <h2>{translate(lngKeys.InviteEmail)}</h2>
        <HelpLink
          iconPath={mdiHelpCircleOutline}
          tooltipText={'Click to see role details.'}
          size={16}
          linkHref={
            'https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
          }
        />
        {sending && <Spinner className='relative' style={{ top: 2 }} />}
      </Flexbox>

      <Form>
        {emailsToInvite.map((email, emailIdx) => {
          return (
            <FormRow key={emailIdx} fullWidth={true}>
              <FormRowItem
                item={{
                  type: 'input',
                  props: {
                    value: email.email,
                    onChange: (event) => onChangeHandler(event, emailIdx),
                    placeholder: 'Email...',
                  },
                }}
              />
              <FormRowItem
                flex='0 0 150px'
                item={{
                  type: 'select',
                  props: {
                    value: {
                      label: getRoleLabel(email.role),
                      value: email.role,
                    },
                    onChange: (option) => selectRole(option, emailIdx),
                    options: selectRoleOptions,
                  },
                }}
              />
            </FormRow>
          )
        })}

        <FormRow>
          <FormRowItem
            item={{
              type: 'button',
              props: {
                variant: 'icon',
                type: 'button',
                iconPath: mdiPlus,
                label: translate(lngKeys.InviteByEmailMore),
                onClick: addMemberForm,
              },
            }}
          />
        </FormRow>
        <FormRow>
          <FormRowItem
            flex='0 0 150px'
            item={{
              type: 'button',
              props: {
                type: 'submit',
                label: translate(lngKeys.GeneralInvite),
                onClick: submitInvites,
                disabled: sending,
              },
            }}
          />
        </FormRow>
      </Form>

      {error != null && (
        <ErrorContainer>
          <ErrorBlock error={error} />
        </ErrorContainer>
      )}
    </Container>
  )
}

const ErrorContainer = styled.div`
  margin-top: 1em;
`

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

export default InviteMemberModalSection

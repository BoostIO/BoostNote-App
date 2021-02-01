import React, { useState, useCallback } from 'react'
import styled from '../../lib/styled'
import CustomButton from '../atoms/buttons/CustomButton'
import ErrorBlock from '../atoms/ErrorBlock'
import { Spinner } from '../atoms/Spinner'
import cc from 'classcat'
import { createTeamInvitesInBulk } from '../../api/teams/invites'
import { SerializedTeam } from '../../interfaces/db/team'

type InviteField = {
  email: string
  accepted: boolean
  inError?: boolean
}

interface InviteFormProps {
  team: SerializedTeam
}

const InviteForm = ({ team }: InviteFormProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const [fields, setFields] = useState<InviteField[]>([
    { email: '', accepted: false },
    { email: '', accepted: false },
    { email: '', accepted: false },
  ])
  const [error, setError] = useState<unknown>()

  const onChangeHandler = useCallback(
    (event: any, index: number) => {
      event.preventDefault()
      const newFields = [...fields]
      newFields[index].email = event.target.value
      setFields(newFields)
    },
    [setFields, fields]
  )

  const submitInvite = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()
      setError(undefined)
      setSending(true)
      try {
        const emailsToInvite = fields.reduce((acc, field, index) => {
          if (field.accepted || field.email.trim() === '') {
            return acc
          }

          acc.set(field.email.trim(), index)
          return acc
        }, new Map<string, number>())

        const { invites } = await createTeamInvitesInBulk(team, {
          emails: [...emailsToInvite.keys()],
        })

        const newFields = [...fields]

        invites.forEach((invite) => {
          const matchedIndex = emailsToInvite.get(invite.email)
          if (matchedIndex == null) {
            return
          }
          newFields[matchedIndex].accepted = true
          newFields[matchedIndex].inError = false
        })

        emailsToInvite.forEach((val) => {
          if (newFields[val].accepted) {
            return
          }
          newFields[val].inError = true
        })
        setFields(newFields)
      } catch (error) {
        setError(error)
      }
      setSending(false)
    },
    [team, fields]
  )

  const inviteMore = useCallback(() => {
    setFields((prev) => {
      return [...prev, { email: '', accepted: false }]
    })
  }, [])

  return (
    <StyledInviteMemberForm onSubmit={submitInvite}>
      <h2>Invite Members</h2>
      {fields.map((field, i) => (
        <div
          className={cc([
            'row',
            field.accepted && 'locked',
            field.inError && 'errored',
          ])}
          key={i}
        >
          <input
            disabled={field.accepted}
            type='email'
            placeholder='name@company.com'
            value={field.email}
            onChange={(ev) => onChangeHandler(ev, i)}
          />
        </div>
      ))}
      {error != null && <ErrorBlock error={error} />}
      <div>
        <span className='invite-more' onClick={inviteMore}>
          + Invite More
        </span>
      </div>
      <StyledInviteSubmit>
        <CustomButton
          type='submit'
          disabled={sending}
          variant='info'
          className='submit-button'
        >
          {sending ? (
            <Spinner
              style={{
                position: 'relative',
                color: '#333',
                top: 0,
                left: 0,
              }}
            />
          ) : (
            'Invite'
          )}
        </CustomButton>
      </StyledInviteSubmit>
    </StyledInviteMemberForm>
  )
}

const StyledInviteMemberForm = styled.form`
  width: 80%;
  min-width: 300px;
  margin: auto;
  display: block;
  height: 100%;
  overflow: hidden auto;
  padding-top: ${({ theme }) => theme.space.xlarge}px;

  h2 {
    text-align: center;
    margin-bottom: ${({ theme }) => theme.space.medium}px;
  }

  .invite-more {
    cursor: pointer;
  }

  .row {
    margin: 10px 0;
    display: block;
    position: relative;
    padding: 0 2px;
    input {
      background-color: #fcfcfd;
      border: 2px solid ${({ theme }) => theme.subtleBorderColor};
      border-radius: 2px;
      color: #45474b;
      &:focus {
        background-color: #fcfcfd;
        box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
      }
      position: relative;
      width: 100%;
      height: 50px;
      padding: ${({ theme }) => theme.space.xsmall}px
        ${({ theme }) => theme.space.small}px;
      padding-left: ${({ theme }) => theme.space.small}px;
      margin-bottom: 10px;
      ::placeholder {
        color: ${({ theme }) => theme.subtleTextColor};
      }
    }

    &.locked {
      input {
        pointer-events: none;
        outline: 2px solid ${({ theme }) => theme.primaryBackgroundColor} !important;
        box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
      }

      &::after {
        content: '✓';
        display: block;
        width: 30px;
        height: 30px;
        position: absolute;
        font-size: ${({ theme }) => theme.fontSizes.large}px;
        top: 10px;
        right: 0;
        color: ${({ theme }) => theme.primaryBackgroundColor};
      }
    }

    &.errored {
      input {
        outline: 2px solid #e85f6c !important;
        box-shadow: 0 0 0 2px #f57480;
      }

      &::after {
        content: '!';
        display: block;
        width: 30px;
        height: 30px;
        position: absolute;
        font-size: ${({ theme }) => theme.fontSizes.default}px;
        top: 0;
        right: 0;
      }
    }
  }
`

const StyledInviteSubmit = styled.div`
  margin: 0 auto;
  text-align: center;
`

export default InviteForm

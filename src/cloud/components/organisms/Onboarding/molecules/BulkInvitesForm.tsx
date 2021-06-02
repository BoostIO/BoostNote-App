import React, { useCallback, useState } from 'react'
import styled from '../../../../../shared/lib/styled'
import { AppComponent } from '../../../../../shared/lib/types'
import cc from 'classcat'
import Form from '../../../../../shared/components/molecules/Form'
import FormRow from '../../../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../shared/components/molecules/Form/templates/FormRowItem'
import copy from 'copy-to-clipboard'
import Button, {
  LoadingButton,
} from '../../../../../shared/components/atoms/Button'
import { isEmailValid } from '../../../../lib/utils/string'
import { useToast } from '../../../../../shared/lib/stores/toast'
import { createTeamInvitesInBulk } from '../../../../api/teams/invites'

interface BulkInvitesFormProps {
  openInviteLink: string
  teamId: string
  onProceed: () => void
}

const BulkInvitesForm: AppComponent<BulkInvitesFormProps> = ({
  children,
  className,
  openInviteLink,
  teamId,
  onProceed,
}) => {
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>('Copy link')
  const [sending, setSending] = useState<boolean>(false)
  const [emails, setEmails] = useState<string>('')
  const { pushApiErrorMessage, pushMessage } = useToast()

  const copyButtonHandler = () => {
    copy(openInviteLink)
    setCopyButtonLabel('✓ Copied')
    setTimeout(() => {
      setCopyButtonLabel('Copy link')
    }, 600)
  }

  const bulkInvites = useCallback(
    async (e: any) => {
      e.preventDefault()
      setSending(true)

      const allEmails = emails.split(',')

      const allEmailsAreValid = allEmails.reduce((acc, email) => {
        if (!isEmailValid(email)) {
          acc = false
        }
        return acc
      }, true)

      if (!allEmailsAreValid) {
        pushMessage({
          title: 'Invalid Format',
          description: 'Some of these emails have an incorrect format.',
        })
        setSending(false)
        return
      }

      try {
        await createTeamInvitesInBulk(
          { id: teamId },
          {
            emails: allEmails.map((e) => e.trim()),
          }
        )
        pushMessage({
          type: 'success',
          title: 'Invites have been sent',
          description:
            'Invitations have been sent, continue to your space and start writing!',
        })
        return
      } catch (error) {
        pushApiErrorMessage(error)
      } finally {
        setSending(false)
      }
    },
    [emails, pushApiErrorMessage, pushMessage, teamId]
  )

  return (
    <Container className={cc(['bulk__invites', className])}>
      <Form onSubmit={copyButtonHandler}>
        <FormRow fullWidth={true} row={{ title: 'Invitation URL' }}>
          <FormRowItem
            flex='1 1 auto'
            item={{
              type: 'input',
              props: {
                value: openInviteLink,
                readOnly: true,
              },
            }}
          />
          <FormRowItem flex='0 0 150px'>
            <Button
              variant='secondary'
              className='secondary__buttons'
              type='submit'
            >
              {copyButtonLabel}
            </Button>
          </FormRowItem>
        </FormRow>
      </Form>
      <Form onSubmit={bulkInvites}>
        <FormRow fullWidth={true} row={{ title: 'Invite via email' }}>
          <FormRowItem
            item={{
              type: 'textarea',
              props: {
                placeholder:
                  'Type or paste in one or multiple emails separated by commas ( , )',
                value: emails,
                onChange: (ev) => setEmails(ev.target.value),
              },
            }}
          />
        </FormRow>

        <FormRow fullWidth={true} className='invites__submit'>
          <FormRowItem flex='0 0 150px'>
            <LoadingButton
              variant='secondary'
              className='secondary__buttons'
              type='submit'
              spinning={sending}
            >
              Send invites
            </LoadingButton>
          </FormRowItem>
        </FormRow>
      </Form>
      {children}
      <div className='end__row'>
        <Button
          onClick={onProceed}
          variant='bordered'
          className='submit-team'
          disabled={sending}
          size='lg'
        >
          Continue to your Space
        </Button>
      </div>
    </Container>
  )
}

const Container = styled.div`
  margin-top: 50px;

  form + form {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px;
  }

  .end__row {
    text-align: center;
  }

  .invites__submit .form__row__items {
    justify-content: flex-end !important;
  }
`

export default BulkInvitesForm

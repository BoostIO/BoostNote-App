import React, { useCallback, useState } from 'react'
import Page from '../../components/Page'
import styled from '../../lib/styled'
import ErrorBlock from '../../components/atoms/ErrorBlock'
import { Spinner } from '../../components/atoms/Spinner'
import Button from '../../components/atoms/Button'
import Flexbox from '../../components/atoms/Flexbox'
import { useNavigateToTeam } from '../../components/atoms/Link/TeamLink'
import {
  getTeamBulkInvitesPageData,
  TeamBulkInvitesPageData,
} from '../../api/pages/teams/invites'
import { getOpenInviteURL, getTeamURL } from '../../lib/utils/patterns'
import copy from 'copy-to-clipboard'
import { inputStyle } from '../../lib/styled/styleFunctions'
import { isEmailValid } from '../../lib/utils/string'
import { createTeamInvitesInBulk } from '../../api/teams/invites'
import { createUnprocessableEntityError } from '../../../lib/db/utils'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const BulkInvitesPage = ({ team, openInvite }: TeamBulkInvitesPageData) => {
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const navigateToTeam = useNavigateToTeam()
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>('Copy')
  const [emailsValue, setEmailsValue] = useState<string>('')

  const copyButtonHandler = () => {
    copy(
      openInvite != null
        ? `${process.env.BASE_URL}${getTeamURL(team)}${getOpenInviteURL(
            openInvite
          )}`
        : ''
    )
    setCopyButtonLabel('✓ Copied')
    setTimeout(() => {
      setCopyButtonLabel('Copy')
    }, 600)
  }

  const bulkInvites = useCallback(
    async (e: any) => {
      e.preventDefault()
      setSending(true)
      try {
        const allEmails = emailsValue.split(',')
        allEmails.forEach((email) => {
          if (!isEmailValid(email)) {
            throw createUnprocessableEntityError(
              'Some email formats are invalid'
            )
          }
        })
        await createTeamInvitesInBulk(team, {
          emails: allEmails.map((e) => e.trim()),
        })
        navigateToTeam(team, 'index', { onboarding: true })
        return
      } catch (error) {
        setError(error)
      }
      setSending(false)
    },
    [navigateToTeam, emailsValue, team]
  )

  return (
    <Page>
      <Container>
        <div className='settings__wrap'>
          <h1>Invite your teammates</h1>
          <p>Boost Note works great for teams of developers.</p>

          <form onSubmit={bulkInvites}>
            {openInvite != null && (
              <div className='invites__row'>
                <label>Invitation URL</label>
                <Flexbox>
                  <input
                    type='text'
                    readOnly={true}
                    value={`${process.env.BASE_URL}${getTeamURL(
                      team
                    )}${getOpenInviteURL(openInvite)}`}
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    className='copy__button'
                    onClick={copyButtonHandler}
                  >
                    {copyButtonLabel}
                  </Button>
                </Flexbox>
              </div>
            )}
            <div className='invites__row'>
              <label>Invite via email</label>
              <textarea
                placeholder='Type or paste in one or multiple emails separated by commas ( , )'
                value={emailsValue}
                onChange={(ev) => setEmailsValue(ev.target.value)}
              />
            </div>
            {error != null && (
              <ErrorBlock error={error} style={{ marginBottom: 32 }} />
            )}
            <Flexbox justifyContent='space-between'>
              <Button
                type='button'
                disabled={sending}
                variant='transparent'
                onClick={() =>
                  navigateToTeam(team, 'index', { onboarding: true })
                }
              >
                Skip
              </Button>
              <Button type='submit' disabled={sending} variant='primary'>
                {sending ? (
                  <Spinner style={{ position: 'relative', top: 0, left: 0 }} />
                ) : (
                  'Invite'
                )}
              </Button>
            </Flexbox>
          </form>
        </div>
      </Container>
    </Page>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  .settings__wrap {
    position: relative;
    width: 800px;
    max-width: 96%;
    margin: 0 auto;
    text-align: center;
  }
  h1 {
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xl}px;
    margin-top: ${({ theme }) => theme.space.xxxlarge}px;
  }
  form {
    text-align: left;
    margin-top: ${({ theme }) => theme.space.xxxlarge}px;
    .invites__row {
      margin: ${({ theme }) => theme.space.medium}px 0;
      position: relative;
    }
    input {
      ${inputStyle}
      width: 100%;
      height: 40px;
      padding: ${({ theme }) => theme.space.xsmall}px
        ${({ theme }) => theme.space.small}px;
    }
    textarea {
      ${inputStyle}
      width: 100%;
      height: 200px;
      padding: ${({ theme }) => theme.space.xsmall}px
        ${({ theme }) => theme.space.small}px;
      resize: none;
    }
    label {
      display: block;
      margin: ${({ theme }) => theme.space.xsmall}px 0;
      font-size: ${({ theme }) => theme.fontSizes.default}px;
      font-weight: 500;
      color: ${({ theme }) => theme.subtleTextColor};
    }
    .copy__button {
      margin-left: ${({ theme }) => theme.space.small}px;
      width: 100px;
    }
  }
`

BulkInvitesPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamBulkInvitesPageData(params)
  return result
}

export default BulkInvitesPage

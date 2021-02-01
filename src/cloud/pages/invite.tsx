import React, { useMemo, useCallback, useState } from 'react'
import Page from '../components/Page'
import Container from '../components/layouts/Container'
import TitleComponent from '../components/atoms/TitleComponent'
import styled from '../lib/styled'
import { useGlobalData } from '../lib/stores/globalData'
import CustomButton from '../components/atoms/buttons/CustomButton'
import ErrorBlock from '../components/atoms/ErrorBlock'
import { cancelTeamInvite } from '../api/teams/invites'
import { useRouter } from 'next/router'
import { createPermissions } from '../api/teams/permissions'
import { getTeamURL } from '../lib/utils/patterns'
import SignInForm from '../components/molecules/SignInForm'
import { callApi } from '../lib/client'
import { SerializedTeamInvite } from '../interfaces/db/teamInvite'
import { GetInitialPropsParameters } from '../interfaces/pages'

const InvitePage = ({ invite }: InvitePageResponseBody) => {
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const router = useRouter()

  const rejectInvite = useCallback(async () => {
    setSending(true)
    try {
      await cancelTeamInvite(invite.team, invite)
      router.push({ pathname: '/index' }, '/')
    } catch (error) {
      setError(error)
      setSending(false)
    }
  }, [invite, router])

  const acceptInvite = useCallback(async () => {
    if (currentUser == null) {
      return
    }

    setSending(true)
    try {
      const { userPermissions } = await createPermissions(invite.team, {
        userId: currentUser.id,
        inviteId: invite.id,
        type: 'invite',
      })
      router.push(
        { pathname: '/[teamId]', query: { teamId: userPermissions.team.id } },
        getTeamURL(userPermissions.team)
      )
    } catch (error) {
      setError(error)
      setSending(false)
    }
  }, [currentUser, invite, router])

  const pageContent = useMemo(() => {
    if (currentUser == null) {
      return (
        <>
          <p>You will need to login in order to accept the invitation</p>
          <SignInForm inviteId={invite.id} disabled={sending} />
          <p>or</p>
          <CustomButton
            variant='secondary'
            disabled={sending}
            onClick={() => rejectInvite()}
            style={{ marginBottom: 20 }}
          >
            Reject
          </CustomButton>
        </>
      )
    } else {
      return (
        <>
          <p>Would you like to join?</p>
          <CustomButton
            variant='secondary'
            disabled={sending}
            onClick={() => rejectInvite()}
          >
            Reject
          </CustomButton>
          <CustomButton
            variant='primary'
            disabled={sending}
            onClick={() => acceptInvite()}
          >
            Join
          </CustomButton>
        </>
      )
    }
  }, [currentUser, invite.id, sending, rejectInvite, acceptInvite])

  return (
    <Page>
      <StyledInvitePage>
        <Container style={{ flex: '0 0 auto' }}>
          <TitleComponent />
        </Container>
        <StyledInvitePageContent>
          {invite.pending ? (
            <StyledInvitePageCard>
              <h1>Join a Team</h1>
              <p>
                You have been invited to: <strong>{invite.team.name}</strong>
              </p>
              <hr />
              {pageContent}
              {error != null && (
                <ErrorBlock style={{ marginTop: 20 }} error={error} />
              )}
            </StyledInvitePageCard>
          ) : (
            <ErrorBlock
              error={{
                title: 'Expired',
                message: 'The invitation has expired',
              }}
              style={{
                width: '500px',
                maxWidth: '96%',
                margin: 'auto',
                textAlign: 'center',
              }}
            />
          )}
        </StyledInvitePageContent>
      </StyledInvitePage>
    </Page>
  )
}

const StyledInvitePage = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => theme.subtleBackgroundColor};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const StyledInvitePageContent = styled.div`
  width: 100%;
  flex: 1 1 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`

const StyledInvitePageCard = styled.div`
  width: 500px;
  max-width: 96%;
  flex: initial 1 0;
  height: auto;
  overflow: hidden auto;
  margin: 20px auto;
  padding: ${({ theme }) => theme.space.xlarge}px
    ${({ theme }) => theme.space.large}px;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  text-align: center;

  h1 {
    margin-bottom: ${({ theme }) => theme.space.default}px;
  }
  hr {
    margin: ${({ theme }) => theme.space.large}px 0;
  }
  button + button {
    margin-left: ${({ theme }) => theme.space.small}px;
  }
`
interface InvitePageResponseBody {
  invite: SerializedTeamInvite
}

InvitePage.getInitialProps = async ({
  search,
  signal,
}: GetInitialPropsParameters) => {
  const result = await callApi('/api/pages/invite', { search, signal })
  return result
}

export default InvitePage

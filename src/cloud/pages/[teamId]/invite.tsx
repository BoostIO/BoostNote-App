import React, { useMemo, useCallback, useState } from 'react'
import Page from '../../components/Page'
import Container from '../../components/layouts/CenteredContainer'
import TitleComponent from '../../components/TitleComponent'
import { useGlobalData } from '../../lib/stores/globalData'
import ErrorBlock from '../../components/ErrorBlock'
import { useRouter } from '../../lib/router'
import { createPermissions } from '../../api/teams/permissions'
import { getTeamURL } from '../../lib/utils/patterns'
import SignInForm from '../../components/SignInForm'
import {
  TeamOpenInvitePageData,
  getTeamOpenInvitePageData,
} from '../../api/pages/teams/invite'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'

const OpenInvitePage = ({ invite }: TeamOpenInvitePageData) => {
  const { globalData } = useGlobalData()
  const { currentUser } = globalData
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const router = useRouter()

  const acceptInvite = useCallback(async () => {
    if (currentUser == null) {
      return
    }

    setSending(true)
    try {
      const { userPermissions } = await createPermissions(invite.team!, {
        userId: currentUser.id,
        inviteId: invite.slug,
        type: 'open',
      })
      router.push(getTeamURL(userPermissions.team))
    } catch (error) {
      setError(error)
      setSending(false)
    }
  }, [currentUser, invite, router])

  const pageContent = useMemo(() => {
    if (currentUser == null) {
      return (
        <div className='content text-center'>
          <p>You will need to login in order to accept the invitation</p>
          <div className='content text-center flex column'>
            <div>
              <h3>Sign in</h3>
              <SignInForm openInviteSlug={invite.slug} disabled={sending} />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className='content text-center flex'>
          <Button
            className='join-button'
            variant='primary'
            disabled={sending}
            onClick={() => acceptInvite()}
          >
            Join
          </Button>
        </div>
      )
    }
  }, [currentUser, invite.slug, sending, acceptInvite])

  return (
    <Page>
      <StyledInvitePage>
        <Container style={{ flex: '0 0 auto' }}>
          <TitleComponent />
        </Container>
        <StyledInvitePageContent>
          <StyledInvitePageCard>
            <h1>Join a Team</h1>
            <p>
              You have been invited to: <strong>{invite.team!.name}</strong>
            </p>
            <hr />
            {pageContent}
            {error != null && (
              <ErrorBlock style={{ marginTop: 20 }} error={error} />
            )}
          </StyledInvitePageCard>
        </StyledInvitePageContent>
      </StyledInvitePage>
    </Page>
  )
}

const StyledInvitePage = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.primary};
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
  padding: ${({ theme }) => theme.sizes.spaces.xl}px
    ${({ theme }) => theme.sizes.spaces.l}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  text-align: center;

  .join-button {
    margin: auto;
  }

  h1 {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }
  hr {
    margin: ${({ theme }) => theme.sizes.spaces.l}px 0;
  }
  button + button {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

OpenInvitePage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTeamOpenInvitePageData(params)
  return result
}

export default OpenInvitePage

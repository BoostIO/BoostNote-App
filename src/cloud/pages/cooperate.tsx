import React, { useState, useCallback, FormEvent } from 'react'
import Page from '../components/Page'
import styled from '../lib/styled'
import { createTeam } from '../api/teams'
import ErrorBlock from '../components/atoms/ErrorBlock'
import { useRouter } from '../lib/router'
import TeamEditForm from '../components/molecules/TeamEditForm'
import { useNavigateToTeam } from '../components/atoms/Link/TeamLink'
import { useElectron } from '../lib/stores/electron'
import { useNavigateToDoc } from '../components/atoms/Link/DocLink'
import { useNav } from '../lib/stores/nav'
import { usePage } from '../lib/stores/pageStore'
import { useSidebarCollapse } from '../lib/stores/sidebarCollapse'
import { moreHeaderId } from '../components/organisms/Sidebar/SidebarMore'

const CooperatePage = () => {
  const [name, setName] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const { query } = useRouter()
  const { usingElectron, sendToElectron } = useElectron()
  const navigateToTeam = useNavigateToTeam()
  const navigateToDoc = useNavigateToDoc()
  const { updateDocsMap } = useNav()
  const { setPartialPageData } = usePage()
  const { setToLocalStorage } = useSidebarCollapse()

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      setSending(true)
      try {
        const body = { name, domain }

        const { team, doc } = await createTeam(body)

        if (usingElectron) {
          sendToElectron('team-create', {
            id: team.id,
            domain: team.domain,
            name: team.name,
          })
          return
        }
        if (doc != null) {
          updateDocsMap([doc.id, doc])
          setPartialPageData({ pageDoc: doc, team })
          setToLocalStorage(team.id, {
            folders: doc.parentFolderId != null ? [doc.parentFolderId] : [],
            workspaces: [doc.workspaceId],
            links: [moreHeaderId],
          })
          navigateToDoc(doc, team, 'index', { onboarding: true })
        } else {
          navigateToTeam(team, 'index', { onboarding: true })
        }
      } catch (error) {
        setSending(false)
        setError(error)
      }
    },
    [
      setSending,
      setError,
      domain,
      name,
      navigateToTeam,
      navigateToDoc,
      usingElectron,
      sendToElectron,
      updateDocsMap,
      setPartialPageData,
      setToLocalStorage,
    ]
  )

  return (
    <Page>
      <StyledCooperatePage>
        <StyledCooperateCard>
          <h2>Create your own team</h2>

          <TeamEditForm
            fullPage={true}
            name={name}
            domain={domain}
            setName={setName}
            setDomain={setDomain}
            sending={sending}
            disabled={sending}
            onSubmit={handleSubmit}
            showSubmitButton={true}
            backButton={!usingElectron && !(query['welcome'] === 'true')}
          />
          {error != null && <ErrorBlock error={error} />}
        </StyledCooperateCard>
      </StyledCooperatePage>
    </Page>
  )
}

export default CooperatePage

const StyledCooperatePage = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.subtleBackgroundColor};
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`

const StyledCooperateCard = styled.div`
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 500px;
  padding: ${({ theme }) => theme.space.xlarge}px
    ${({ theme }) => theme.space.large}px;
  border-radius: 5px;

  h2 {
    text-align: center;
    color: ${({ theme }) => theme.emphasizedTextColor};
    margin-bottom: ${({ theme }) => theme.space.xlarge}px;
  }
`

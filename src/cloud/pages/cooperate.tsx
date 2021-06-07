import React, { useState, useCallback, FormEvent } from 'react'
import { createTeam, updateTeamIcon } from '../api/teams'
import { getTeamLinkHref } from '../components/atoms/Link/TeamLink'
import { useElectron } from '../lib/stores/electron'
import { useNav } from '../lib/stores/nav'
import { usePage } from '../lib/stores/pageStore'
import { useSidebarCollapse } from '../lib/stores/sidebarCollapse'
import { useGlobalData } from '../lib/stores/globalData'
import { GetInitialPropsParameters } from '../interfaces/pages'
import { getDocLinkHref } from '../components/atoms/Link/DocLink'
import UsagePage from '../components/organisms/Onboarding/UsagePage'
import styled from '../../shared/lib/styled'
import OnboardingLayout from '../components/organisms/Onboarding/layouts/OnboardingLayout'
import BulkInvitesForm from '../components/organisms/Onboarding/molecules/BulkInvitesForm'
import { useToast } from '../../shared/lib/stores/toast'
import CreateTeamForm from '../components/organisms/Onboarding/molecules/CreateTeamForm'
import { SerializedTeam } from '../interfaces/db/team'
import { SerializedDoc } from '../interfaces/db/doc'
import { SerializedOpenInvite } from '../interfaces/db/openInvite'
import { boostHubBaseUrl } from '../lib/consts'
import { getOpenInviteURL, getTeamURL } from '../lib/utils/patterns'

const CooperatePage = () => {
  const [name, setName] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const { usingElectron, sendToElectron } = useElectron()
  const { updateDocsMap } = useNav()
  const { setTeamInGlobal } = useGlobalData()
  const { setPartialPageData } = usePage()
  const { setToLocalStorage } = useSidebarCollapse()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [state, setState] = useState<'usage' | 'create'>('usage')
  const { pushApiErrorMessage } = useToast()
  const [createTeamReturn, setCreateTeamReturn] = useState<{
    team: SerializedTeam
    doc: SerializedDoc
    openInvite: SerializedOpenInvite
  }>()

  const changeHandler = useCallback((file: File) => {
    setIconFile(file)
    setFileUrl(URL.createObjectURL(file))
  }, [])

  const createTeamCallback = useCallback(
    async (personal: boolean) => {
      setSending(true)
      try {
        const body = personal ? { personal: true } : { name, domain }

        const { team, doc, openInvite, initialFolders } = await createTeam(body)

        if (usingElectron) {
          sendToElectron('team-create', {
            id: team.id,
            domain: team.domain,
            name: team.name,
          })
          return
        }

        if (!personal && iconFile != null) {
          const { icon } = await updateTeamIcon(team, iconFile)
          team.icon = icon
        }
        setTeamInGlobal(team)

        if (doc != null) {
          updateDocsMap([doc.id, doc])
          setPartialPageData({ pageDoc: doc, team })
        }

        setToLocalStorage(team.id, {
          folders: initialFolders.map((folder) => folder.id),
          workspaces: [
            ...new Set(initialFolders.map((folder) => folder.workspaceId)),
          ],
          links: [],
        })

        if (personal && doc != null) {
          window.location.href = getDocLinkHref(doc, team, 'index', {
            onboarding: true,
          })
        } else if (doc != null && openInvite != null) {
          setCreateTeamReturn({ team, doc, openInvite })
        } else {
          window.location.href = getTeamLinkHref(team, 'index', {
            onboarding: true,
          })
        }
      } catch (error) {
        setSending(false)
        pushApiErrorMessage(error)
      }
    },
    [
      name,
      domain,
      usingElectron,
      iconFile,
      setTeamInGlobal,
      sendToElectron,
      updateDocsMap,
      setPartialPageData,
      pushApiErrorMessage,
      setToLocalStorage,
    ]
  )

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      createTeamCallback(false)
    },
    [createTeamCallback]
  )

  const onUsageCallback = useCallback(
    (val: 'personal' | 'team') => {
      if (val === 'personal') {
        return createTeamCallback(true)
      }
      setState('create')
      return
    },
    [createTeamCallback]
  )

  if (createTeamReturn != null) {
    return (
      <OnboardingLayout
        title='Invite co-workers to your team'
        subtitle='Boost Note is meant to be used with your team. Invite some co-workers to test it out with!'
        contentWidth={600}
      >
        <Container>
          <BulkInvitesForm
            openInviteLink={`${boostHubBaseUrl}${getTeamURL(
              createTeamReturn.team
            )}${getOpenInviteURL(createTeamReturn.openInvite)}`}
            teamId={createTeamReturn.team.id}
            onProceed={() => {
              return (window.location.href = getDocLinkHref(
                createTeamReturn.doc,
                createTeamReturn.team,
                'index',
                {
                  onboarding: true,
                }
              ))
            }}
          />
        </Container>
      </OnboardingLayout>
    )
  }

  if (state === 'usage') {
    return <UsagePage onUsage={onUsageCallback} sending={sending} />
  }

  return (
    <OnboardingLayout
      title='Create a team account'
      subtitle='Please tell us your team information.'
      contentWidth={600}
    >
      <Container>
        <CreateTeamForm
          fullPage={true}
          name={name}
          domain={domain}
          setName={setName}
          setDomain={setDomain}
          sending={sending}
          disabled={sending}
          onSubmit={handleSubmit}
          fileUrl={fileUrl != null ? fileUrl : undefined}
          onFileChange={changeHandler}
          showSubmitButton={true}
          goBack={() => setState('usage')}
        />
      </Container>
    </OnboardingLayout>
  )
}

CooperatePage.getInitialProps = async (_params: GetInitialPropsParameters) => {
  return {}
}

export default CooperatePage

const Container = styled.div`
  text-align: left;

  .button__variant--bordered {
    width: 300px !important;
  }

  .end__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }
`

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
import { mdiClose } from '@mdi/js'
import Button from '../../shared/components/atoms/Button'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import { SpaceUsageIntent } from '../components/organisms/Onboarding/molecules/UsageFormRow'
import { MixpanelActionTrackTypes } from '../interfaces/analytics/mixpanel'
import { trackEvent } from '../api/track'

const CooperatePage = () => {
  const [intent, setIntent] = useState<SpaceUsageIntent>()
  const [name, setName] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const { translate } = useI18n()
  const { usingElectron, sendToElectron } = useElectron()
  const { updateDocsMap } = useNav()
  const { setTeamInGlobal } = useGlobalData()
  const { setPartialPageData } = usePage()
  const { setToLocalStorage } = useSidebarCollapse()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
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

  const createTeamCallback = useCallback(async () => {
    setSending(true)
    try {
      const body = { name, domain }

      const { team, doc, openInvite, initialFolders } = await createTeam(body)

      if (usingElectron) {
        sendToElectron('team-create', {
          id: team.id,
          domain: team.domain,
          name: team.name,
        })
        return
      }

      if (iconFile != null) {
        const { icon } = await updateTeamIcon(team, iconFile)
        team.icon = icon
      }
      setTeamInGlobal(team)

      if (doc != null) {
        updateDocsMap([doc.id, doc])
        setPartialPageData({ pageDoc: doc, team })
      }

      setToLocalStorage(team.id, {
        folders: initialFolders
          .filter((f) => f.parentFolder == null)
          .map((folder) => folder.id),
        workspaces: [
          ...new Set(initialFolders.map((folder) => folder.workspaceId)),
        ],
        links: [],
      })

      if (intent != null) {
        await trackEvent(
          intent === 'personal'
            ? MixpanelActionTrackTypes.SpaceIntentPersonal
            : MixpanelActionTrackTypes.SpaceIntentTeam,
          {
            teamId: team.id,
          }
        )
      }

      if (doc != null && openInvite != null) {
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
  }, [
    name,
    intent,
    domain,
    usingElectron,
    iconFile,
    setTeamInGlobal,
    sendToElectron,
    updateDocsMap,
    setPartialPageData,
    pushApiErrorMessage,
    setToLocalStorage,
  ])

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      createTeamCallback()
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

  return (
    <OnboardingLayout
      title={translate(lngKeys.CooperateTitle)}
      subtitle={translate(lngKeys.CooperateSubtitle)}
      contentWidth={600}
    >
      {usingElectron && (
        <ElectronButtonContainer>
          <Button
            variant='icon'
            iconSize={34}
            iconPath={mdiClose}
            onClick={() => {
              sendToElectron('router', 'back')
            }}
            className='electron__goback'
          />
        </ElectronButtonContainer>
      )}
      <Container>
        <CreateTeamForm
          fullPage={true}
          intent={intent}
          setIntent={setIntent}
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
        />
      </Container>
    </OnboardingLayout>
  )
}

CooperatePage.getInitialProps = async (_params: GetInitialPropsParameters) => {
  return {}
}

export default CooperatePage

const ElectronButtonContainer = styled.div`
  .electron__goback {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
  }
`

const Container = styled.div`
  text-align: left;

  .button__variant--bordered {
    width: 300px !important;
  }

  .end__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }
`

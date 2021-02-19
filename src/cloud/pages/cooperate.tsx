import React, { useState, useCallback, FormEvent } from 'react'
import Page from '../components/Page'
import styled from '../lib/styled'
import { createTeam, updateTeamIcon } from '../api/teams'
import ErrorBlock from '../components/atoms/ErrorBlock'
import TeamEditForm from '../components/molecules/TeamEditForm'
import { getTeamLinkHref } from '../components/atoms/Link/TeamLink'
import { useElectron } from '../lib/stores/electron'
import { useNav } from '../lib/stores/nav'
import { usePage } from '../lib/stores/pageStore'
import { useSidebarCollapse } from '../lib/stores/sidebarCollapse'
import { moreHeaderId } from '../components/organisms/Sidebar/SidebarMore'
import { mdiDomain } from '@mdi/js'
import Icon from '../components/atoms/Icon'
import { baseIconStyle } from '../lib/styled/styleFunctions'
import { useGlobalData } from '../lib/stores/globalData'
import { GetInitialPropsParameters } from '../interfaces/pages'
import { getDocLinkHref } from '../components/atoms/Link/DocLink'
import UsagePage from '../components/organisms/Onboarding/UsagePage'

const CooperatePage = () => {
  const [name, setName] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const { usingElectron, sendToElectron } = useElectron()
  const { updateDocsMap } = useNav()
  const { setTeamInGlobal } = useGlobalData()
  const { setPartialPageData } = usePage()
  const { setToLocalStorage } = useSidebarCollapse()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [showTeamForm, setShowTeamForm] = useState(false)

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (
        event.target != null &&
        event.target.files != null &&
        event.target.files.length > 0
      ) {
        const file = event.target.files[0]
        setIconFile(file)
        setFileUrl(URL.createObjectURL(file))
      }
    },
    []
  )

  const createTeamCallback = useCallback(
    async (personal: boolean) => {
      setSending(true)
      try {
        const body = personal ? { personal: true } : { name, domain }

        const { team, doc } = await createTeam(body)

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
          setToLocalStorage(team.id, {
            folders: doc.parentFolderId != null ? [doc.parentFolderId] : [],
            workspaces: [doc.workspaceId],
            links: [moreHeaderId],
          })

          window.location.href = getDocLinkHref(doc, team, 'index', {
            onboarding: true,
          })
        } else {
          window.location.href = getTeamLinkHref(team, 'invites', {
            onboarding: true,
          })
        }
      } catch (error) {
        setSending(false)
        setError(error)
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
      setShowTeamForm(true)
      return
    },
    [createTeamCallback]
  )

  if (!showTeamForm) {
    return (
      <UsagePage onUsage={onUsageCallback} sending={sending} error={error} />
    )
  }

  return (
    <Page>
      <Container>
        <div className='settings__wrap'>
          <h1>Create a team account</h1>
          <p>Please tell us your team information.</p>

          <div className='row'>
            <div className='profile__row'>
              {fileUrl != null ? (
                <img src={fileUrl} className='profile__pic' />
              ) : (
                <Icon path={mdiDomain} className='profile__icon' size={100} />
              )}
            </div>
            <label htmlFor='profile' className='profile__label'>
              {fileUrl == null ? 'Add a photo' : 'Change your photo'}
            </label>
            <input
              id='profile'
              name='profile'
              accept='image/*'
              type='file'
              onChange={changeHandler}
            />
          </div>
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
            goBack={() => setShowTeamForm(false)}
          />
          {error != null && <ErrorBlock error={error} />}
        </div>
      </Container>
    </Page>
  )
}

CooperatePage.getInitialProps = async (_params: GetInitialPropsParameters) => {
  return {}
}

export default CooperatePage

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;

  .profile__icon {
    width: 100px;
    height: 100px;
    color: ${({ theme }) => theme.secondaryBorderColor};
  }

  .profile__row {
    margin: ${({ theme }) => theme.space.xxlarge}px 0
      ${({ theme }) => theme.space.small}px 0;
    text-align: center;
  }

  .profile__label {
    font-size: ${({ theme }) => theme.fontSizes.large}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-weight: 300;
    text-align: center;
    display: block;
    cursor: pointer;
    ${baseIconStyle}
  }

  #profile {
    display: none;
  }

  .profile__pic {
    display: block;
    margin: auto;
    object-fit: cover;
    width: 100px;
    height: 100px;
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
    border-radius: 100%;
  }

  .settings__wrap {
    position: relative;
    width: 600px;
    max-width: 96%;
    margin: 0 auto;
    text-align: center;
  }

  h1 {
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xl}px;
    margin-top: ${({ theme }) => theme.space.xxxlarge}px;
  }

  .row {
    margin: 20px 0;
    display: block;
    position: relative;
    label {
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }
`

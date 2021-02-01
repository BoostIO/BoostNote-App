import React, { useCallback, useState, useMemo } from 'react'
import {
  Column,
  Scrollable,
  Section,
  TabHeader,
  SectionDescription,
  SectionSeparator,
  SectionFlexLeft,
} from './styled'
import { useToast } from '../../../lib/stores/toast'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import TeamEditForm from '../../molecules/TeamEditForm'
import { useRouter } from 'next/router'
import { useGlobalData } from '../../../lib/stores/globalData'
import { updateTeam, updateTeamIcon } from '../../../api/teams'
import CustomButton from '../../atoms/buttons/CustomButton'
import { useTranslation } from 'react-i18next'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { Spinner } from '../../atoms/Spinner'
import IconInput from '../../molecules/IconInput'
import { buildIconUrl } from '../../../api/files'
import { useSettings } from '../../../lib/stores/settings'
import TeamLink from '../../atoms/Link/TeamLink'
import { useElectron } from '../../../lib/stores/electron'

const TeamInfoTab = () => {
  const { team, setPartialPageData } = usePage<PageStoreWithTeam>()
  const {
    setTeamInGlobal,
    globalData: { currentUser },
  } = useGlobalData()
  const initData =
    team != null
      ? { ...team, domain: team.domain != null ? team.domain : '' }
      : {
          name: '',
          domain: '',
        }
  const { pushMessage } = useToast()
  const [name, setName] = useState<string>(initData.name)
  const [sending, setSending] = useState<boolean>(false)
  const router = useRouter()
  const { t } = useTranslation()
  const [iconFile, setIconFile] = useState<File | null>()
  const { closeSettingsTab } = useSettings()
  const { usingElectron, sendToElectron } = useElectron()

  const updateHandler = useCallback(async () => {
    const currentTeam = team
    if (currentTeam == null || sending) {
      return
    }
    setSending(true)
    try {
      const body = { name }
      const { team } = await updateTeam(currentTeam.id, body)
      if (iconFile != null) {
        const { icon } = await updateTeamIcon(team, iconFile)
        team.icon = icon
      }

      setPartialPageData({ team })
      setTeamInGlobal(team)
      if (usingElectron) {
        sendToElectron('team-update', team)
      }
      const routeRegex = new RegExp('(^/[^/]+)')
      router.replace(
        router.pathname,
        router.asPath.replace(
          routeRegex,
          `/${
            team.domain != null && team.domain !== '' ? team.domain : team.id
          }`
        ),
        { shallow: true }
      )
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: `Could not update your team information`,
      })
    }
    setSending(false)
  }, [
    setSending,
    name,
    pushMessage,
    sending,
    setPartialPageData,
    setTeamInGlobal,
    router,
    team,
    iconFile,
    usingElectron,
    sendToElectron,
  ])

  const adminContent = useMemo(() => {
    if (
      currentUser == null ||
      team == null ||
      team.permissions == null ||
      team.permissions.length === 0
    ) {
      return null
    }

    try {
      const currentUserPermissions = (team.permissions as SerializedUserTeamPermissions[]).filter(
        (p) => p.user.id === currentUser.id
      )[0]
      if (currentUserPermissions.role === 'admin') {
        return (
          <>
            <SectionSeparator />
            <Section>
              <SectionDescription>Team Deletion</SectionDescription>

              <SectionDescription>
                Once you delete this team we will remove all associated data.
                There is no turning back.
                <TeamLink
                  intent='delete'
                  team={team}
                  beforeNavigate={() => closeSettingsTab()}
                >
                  {' '}
                  {t('general.delete')}
                </TeamLink>
              </SectionDescription>
            </Section>
          </>
        )
      }
      return null
    } catch (error) {
      return null
    }
  }, [team, , currentUser, t, closeSettingsTab])

  const iconUrl = useMemo(() => {
    return team != null && team.icon != null
      ? buildIconUrl(team.icon.location)
      : undefined
  }, [team])

  if (team == null) {
    return null
  }

  return (
    <Column>
      <Scrollable>
        <TabHeader>{t('settings.teamInfo')}</TabHeader>
        <Section>
          <TeamEditForm
            name={name}
            setName={setName}
            disabled={sending}
            sending={sending}
            showSubmitButton={false}
          />
          <div>
            <label>Icon</label>
            <IconInput defaultUrl={iconUrl} onChange={setIconFile} />
          </div>
          <SectionFlexLeft>
            <CustomButton
              variant='primary'
              onClick={updateHandler}
              style={{ marginRight: 10, maxWidth: 150, textAlign: 'center' }}
              disabled={sending}
            >
              {sending ? (
                <Spinner style={{ fontSize: 16 }} />
              ) : (
                t('general.update')
              )}
            </CustomButton>
            <CustomButton onClick={closeSettingsTab} variant='secondary'>
              {t('general.cancel')}
            </CustomButton>
          </SectionFlexLeft>
          {adminContent}
        </Section>
      </Scrollable>
    </Column>
  )
}

export default TeamInfoTab

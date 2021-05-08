import React, { useMemo } from 'react'
import { SectionDescription, SectionSeparator } from './styled'
import { usePage } from '../../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../lib/stores/settings'
import TeamLink from '../../atoms/Link/TeamLink'
import SettingsTeamForm from '../../molecules/SettingsTeamForm'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const TeamInfoTab = () => {
  const { team, currentUserPermissions } = usePage<PageStoreWithTeam>()

  const { t } = useTranslation()
  const { closeSettingsTab } = useSettings()

  const adminContent = useMemo(() => {
    if (
      currentUserPermissions == null ||
      team == null ||
      currentUserPermissions.role !== 'admin'
    ) {
      return null
    }

    return (
      <>
        <SectionSeparator />
        <section>
          <SectionDescription>Space Deletion</SectionDescription>

          <SectionDescription>
            Once you delete this space we will remove all associated data. There
            is no turning back.{' '}
            <TeamLink
              intent='delete'
              team={team}
              beforeNavigate={() => closeSettingsTab()}
            >
              {t('general.delete')}
            </TeamLink>
          </SectionDescription>
        </section>
      </>
    )
  }, [team, , currentUserPermissions, t, closeSettingsTab])

  if (team == null) {
    return null
  }

  return (
    <SettingTabContent
      header={t('settings.teamInfo')}
      body={
        <section>
          <SettingsTeamForm team={team} teamConversion={false} header={false} />
          {adminContent}
        </section>
      }
    ></SettingTabContent>
  )
}

export default TeamInfoTab

import React, { useMemo } from 'react'
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
        <section>
          <h2>Delete Space</h2>
          <p className='text--subtle'>
            Once you delete this space we will remove all associated data. There
            is no turning back.{' '}
            <TeamLink
              intent='delete'
              team={team}
              beforeNavigate={() => closeSettingsTab()}
            >
              {t('general.delete')}
            </TeamLink>
          </p>
        </section>
      </>
    )
  }, [team, , currentUserPermissions, t, closeSettingsTab])

  if (team == null) {
    return null
  }

  return (
    <SettingTabContent
      title={t('settings.teamInfo')}
      description={'Manage your space settings.'}
      body={
        <section>
          <SettingsTeamForm team={team} teamConversion={false} header={false} />
        </section>
      }
      footer={adminContent}
    ></SettingTabContent>
  )
}

export default TeamInfoTab

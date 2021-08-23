import React, { useMemo } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../lib/stores/settings'
import TeamLink from '../Link/TeamLink'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import ViewerRestrictedWrapper from '../ViewerRestrictedWrapper'
import { lngKeys } from '../../lib/i18n/types'
import SettingsTeamForm from '../SettingsTeamForm'

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
          <h2>{t(lngKeys.SettingsSpaceDelete)}</h2>
          <p className='text--subtle'>
            {t(lngKeys.SettingsSpaceDeleteWarning)}{' '}
            <TeamLink
              intent='delete'
              team={team}
              beforeNavigate={() => closeSettingsTab()}
            >
              {t(lngKeys.GeneralDelete)}
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
      title={t(lngKeys.SettingsTeamInfo)}
      description={t(lngKeys.ManageSpaceSettings)}
      body={
        <ViewerRestrictedWrapper>
          <section>
            <SettingsTeamForm team={team} />
          </section>
        </ViewerRestrictedWrapper>
      }
      footer={adminContent}
    />
  )
}

export default TeamInfoTab

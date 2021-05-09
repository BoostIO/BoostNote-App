import React from 'react'
import { useTranslation } from 'react-i18next'
import UserPreferencesForm from './UserPreferencesForm'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const PreferencesTab = () => {
  const { t } = useTranslation()

  return (
    <SettingTabContent
      title={t('settings.preferences')}
      description={'Manage your preferences.'}
      body={<UserPreferencesForm />}
    ></SettingTabContent>
  )
}

export default PreferencesTab

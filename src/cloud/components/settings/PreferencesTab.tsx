import React from 'react'
import { useTranslation } from 'react-i18next'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { lngKeys } from '../../lib/i18n/types'
import UserPreferencesForm from './UserPreferencesForm'

const PreferencesTab = () => {
  const { t } = useTranslation()

  return (
    <SettingTabContent
      title={t(lngKeys.SettingsPreferences)}
      description={t(lngKeys.ManagePreferences)}
      body={<UserPreferencesForm />}
    />
  )
}

export default PreferencesTab

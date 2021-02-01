import React from 'react'
import { TabHeader, Column, Scrollable } from './styled'
import { useTranslation } from 'react-i18next'
import UserPreferencesForm from './UserPreferencesForm'

const PreferencesTab = () => {
  const { t } = useTranslation()

  return (
    <Column>
      <Scrollable>
        <TabHeader className='marginTop'>{t('settings.preferences')}</TabHeader>
        <UserPreferencesForm />
      </Scrollable>
    </Column>
  )
}

export default PreferencesTab

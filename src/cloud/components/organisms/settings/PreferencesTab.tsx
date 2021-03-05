import React from 'react'
import { TabHeader, Column, Container, Scrollable } from './styled'
import { useTranslation } from 'react-i18next'
import UserPreferencesForm from './UserPreferencesForm'

const PreferencesTab = () => {
  const { t } = useTranslation()

  return (
    <Column>
      <Scrollable>
        <Container>
          <TabHeader className='marginTop'>
            {t('settings.preferences')}
          </TabHeader>
          <UserPreferencesForm />
        </Container>
      </Scrollable>
    </Column>
  )
}

export default PreferencesTab

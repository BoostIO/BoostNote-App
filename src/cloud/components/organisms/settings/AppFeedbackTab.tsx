import React from 'react'
import { Column, Scrollable, Section, TabHeader } from './styled'
import { useTranslation } from 'react-i18next'
import AppFeedbackForm from '../../molecules/AppFeedbackForm'

const AppFeedbackTab = () => {
  const { t } = useTranslation()

  return (
    <Column>
      <Scrollable>
        <TabHeader>{t('settings.appFeedback')}</TabHeader>
        <Section>
          <AppFeedbackForm />
        </Section>
      </Scrollable>
    </Column>
  )
}

export default AppFeedbackTab

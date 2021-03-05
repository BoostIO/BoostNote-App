import React from 'react'
import { Column, Container, Scrollable, Section, TabHeader } from './styled'
import { useTranslation } from 'react-i18next'
import AppFeedbackForm from '../../molecules/AppFeedbackForm'

const AppFeedbackTab = () => {
  const { t } = useTranslation()

  return (
    <Column>
      <Scrollable>
        <Container>
          <TabHeader>{t('settings.appFeedback')}</TabHeader>
          <Section>
            <AppFeedbackForm />
          </Section>
        </Container>
      </Scrollable>
    </Column>
  )
}

export default AppFeedbackTab

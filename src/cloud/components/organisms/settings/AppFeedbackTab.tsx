import React from 'react'
import { useTranslation } from 'react-i18next'
import AppFeedbackForm from '../../molecules/AppFeedbackForm'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const AppFeedbackTab = () => {
  const { t } = useTranslation()

  return (
    <SettingTabContent
      header={t('settings.appFeedback')}
      body={
        <section>
          <AppFeedbackForm />
        </section>
      }
    ></SettingTabContent>
  )
}

export default AppFeedbackTab

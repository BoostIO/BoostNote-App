import React from 'react'
import { usePreferences } from '../../lib/preferences'
import { useTranslation } from 'react-i18next'

export default () => {
  const { t } = useTranslation()
  return (
    <Section>
      <SectionHeader>{t('preferences.export')}</SectionHeader>
    </Section>
  )
}

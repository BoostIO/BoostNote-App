import React, { useCallback } from 'react'
import { usePreferences } from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { Section, SectionHeader, SectionControl } from './styled'
import { FormCheckItem } from '../atoms/form'

export default () => {
  const { t } = useTranslation()
  const { preferences, setPreferences } = usePreferences()

  const toggleFrontMatterExport: React.ChangeEventHandler<
    HTMLInputElement
  > = useCallback(
    event => {
      setPreferences({
        'export.markdown.includeFrontMatter': event.target.checked
      })
    },
    [setPreferences]
  )

  return (
    <div>
      <Section>
        <SectionHeader>Include front-matters in markdown export</SectionHeader>
        <SectionControl>
          <FormCheckItem
            id='checkbox-include-front-matters'
            type='checkbox'
            checked={preferences['export.markdown.includeFrontMatter']}
            onChange={toggleFrontMatterExport}
          >
            Include front-matters in markdown export
          </FormCheckItem>
        </SectionControl>
      </Section>
    </div>
  )
}

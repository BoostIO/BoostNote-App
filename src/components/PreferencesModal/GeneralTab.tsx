import React, { useCallback } from 'react'
import { SectionHeader } from './styled'
import { usePreferences } from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { getNoteSortingOptionLabel, noteSortingOptions } from '../../lib/sort'
import { SimpleFormSelect } from '../../shared/components/molecules/Form/atoms/FormSelect'
import Form from '../../shared/components/molecules/Form'

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const { report } = useAnalytics()
  const { t } = useTranslation()

  const selectTheme = useCallback(
    (value) => {
      setPreferences({
        'general.theme': value,
      })
      report(analyticsEvents.updateUiTheme)
    },
    [setPreferences, report]
  )

  const selectNoteSorting = useCallback(
    (noteSortingOption) => {
      setPreferences({
        'general.noteSorting': noteSortingOption,
      })
    },
    [setPreferences]
  )
  return (
    <div>
      <SectionHeader>{t('preferences.generalTab')}</SectionHeader>
      <Form
        rows={[
          {
            title: t('preferences.applicationTheme'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['general.theme']}
                    onChange={selectTheme}
                    options={['dark', 'light', 'sepia', 'solarizedDark']}
                    labels={['Dark', 'Light', 'Sepia', 'Solarized Dark']}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.noteSorting'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['general.noteSorting']}
                    onChange={selectNoteSorting}
                    options={noteSortingOptions}
                    labels={noteSortingOptions.map((noteSortingOption) =>
                      getNoteSortingOptionLabel(noteSortingOption)
                    )}
                  />
                ),
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default GeneralTab

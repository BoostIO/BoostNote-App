import React, { ChangeEventHandler } from 'react'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { Section, SectionHeader, SectionControl } from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteSortingOptions
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'

type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()

  const selectTheme: SelectChangeEventHandler = event => {
    setPreferences({
      'general.theme': event.target.value as GeneralThemeOptions
    })
  }

  const selectLanguage: SelectChangeEventHandler = event => {
    setPreferences({
      'general.language': event.target.value as GeneralLanguageOptions
    })
  }

  const selectNoteSorting: SelectChangeEventHandler = event => {
    setPreferences({
      'general.noteSorting': event.target.value as GeneralNoteSortingOptions
    })
  }

  const setEnableAnalytics: ChangeEventHandler<HTMLInputElement> = event => {
    setPreferences({
      'general.enableAnalytics': event.target.checked
    })
  }

  const { t } = useTranslation()

  return (
    <div>
      <Section>
        <SectionHeader>{t('preferences.account')}</SectionHeader>
        <div>
          <button>
            <Icon path={mdiPlus} />
            {t('preferences.addAccount')}
          </button>
        </div>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.interfaceLanguage')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.language']}
            onChange={selectLanguage}
          >
            <option value='en-US'>English (US)</option>
            <option value='ja'>Japanese</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.applicationTheme')}</SectionHeader>
        <SectionControl>
          <select value={preferences['general.theme']} onChange={selectTheme}>
            <option value='auto'>{t('preferences.auto')}</option>
            <option value='light'>{t('preferences.light')}</option>
            <option value='dark'>{t('preferences.dark')}</option>
            <option value='solarized-dark'>
              {t('preferences.solarizedDark')}
            </option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.noteSorting')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.noteSorting']}
            onChange={selectNoteSorting}
          >
            <option value='date-updated'>{t('preferences.dateUpdated')}</option>
            <option value='date-created'>{t('preferences.dateCreated')}</option>
            <option value='title'>{t('preferences.title')}</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.analytics')}</SectionHeader>
        <SectionControl>
          <p>{t('preferences.analyticsDescription1')}</p>
          <p>{t('preferences.analyticsDescription2')}</p>
          <label>
            <input
              type='checkbox'
              checked={preferences['general.enableAnalytics']}
              onChange={setEnableAnalytics}
            />

            {t('preferences.analyticsLabel')}
          </label>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab

import React, { useCallback } from 'react'
import { Section, SectionHeader, SectionControl, SectionSelect } from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteListViewOptions,
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { SelectChangeEventHandler } from '../../lib/events'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { FormCheckItem } from '../atoms/form'
import { NoteSortingOptions } from '../../lib/sort'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const { report } = useAnalytics()

  const selectTheme: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.theme': event.target.value as GeneralThemeOptions,
      })
      report(analyticsEvents.updateUiTheme)
    },
    [setPreferences, report]
  )

  const selectLanguage: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.language': event.target.value as GeneralLanguageOptions,
      })
    },
    [setPreferences]
  )

  const selectNoteSorting: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.noteSorting': event.target.value as NoteSortingOptions,
      })
    },
    [setPreferences]
  )

  const selectNoteListView: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.noteListView': event.target
          .value as GeneralNoteListViewOptions,
      })
    },
    [setPreferences]
  )

  const toggleEnableAutoSync: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'general.enableAutoSync': event.target.checked,
      })
    },
    [setPreferences]
  )

  const toggleShowSubfolderContents: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'general.showSubfolderContents': event.target.checked,
      })
    },
    [setPreferences]
  )

  const { t } = useTranslation()

  return (
    <div>
      <Section>
        <SectionHeader>{t('preferences.interfaceLanguage')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.language']}
            onChange={selectLanguage}
          >
            <option value='de'>🇩🇪Deutsch</option>
            <option value='en-US'>🇺🇸English (US)</option>
            <option value='es-ES'>🇪🇸Español (España)</option>
            <option value='fr-FR'>🇫🇷Français (France)</option>
            <option value='it-IT'>🇮🇹️Italiano (Italia)</option>
            <option value='ja'>🇯🇵日本語</option>
            <option value='ko'>🇰🇷한국어</option>
            <option value='pt-BR'>🇧🇷Português (BR)</option>
            <option value='uk-UA'>🇺🇦Українська</option>
            <option value='zh-CN'>🇨🇳中文 (CN)</option>
            <option value='zh-HK'>🇭🇰中文 (HK)</option>
            <option value='zh-TW'>🇹🇼中文 (TW)</option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.applicationTheme')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.theme']}
            onChange={selectTheme}
          >
            <option value='dark'>{t('preferences.dark')}</option>
            <option value='light'>{t('preferences.light')}</option>
            <option value='sepia'>{t('preferences.sepia')}</option>
            <option value='legacy'>Legacy</option>
            <option value='solarizedDark'>
              {t('preferences.solarizedDark')}
            </option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.noteSorting')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.noteSorting']}
            onChange={selectNoteSorting}
          >
            <NoteSortingOptionsFragment />
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.notesView')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.noteListView']}
            onChange={selectNoteListView}
          >
            <option value='default'>{t('preferences.notesViewDefault')}</option>
            <option value='compact'>{t('preferences.notesViewCompact')}</option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.autoSync')}</SectionHeader>
        <SectionControl>
          <FormCheckItem
            id='checkbox-enable-auto-sync'
            type='checkbox'
            checked={preferences['general.enableAutoSync']}
            onChange={toggleEnableAutoSync}
          >
            {t('preferences.autoSync')}
          </FormCheckItem>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.subfolders')}</SectionHeader>
        <SectionControl>
          <FormCheckItem
            id='checkbox-show-subfolder-content'
            type='checkbox'
            checked={preferences['general.showSubfolderContents']}
            onChange={toggleShowSubfolderContents}
          >
            {t('preferences.subfoldersView')}
          </FormCheckItem>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab

import React, { useCallback } from 'react'
import { Section, SectionSelect, SectionHeader3 } from './styled'
import {
  useSettings,
  GeneralThemeOptions,
  codeMirrorEditorThemes,
  CodeMirrorEditorTheme,
  codeMirrorKeyMap,
  CodeMirrorKeyMap,
  GeneralEditorIndentType,
  GeneralEditorIndentSize,
} from '../../../lib/stores/settings'
import { useTranslation } from 'react-i18next'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const UserPreferencesForm = () => {
  const { settings, setSettings } = useSettings()
  const { t } = useTranslation()

  const selectTheme: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.theme': event.target.value as GeneralThemeOptions,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeApp, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  const selectEditorTheme: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorTheme': event.target.value as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeEditor, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  const selectCodeBlockTheme: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.codeBlockTheme': event.target.value as CodeMirrorEditorTheme,
      })

      trackEvent(MixpanelActionTrackTypes.ThemeChangeCodeblock, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  const selectEditorKeyMap: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorKeyMap': event.target.value as CodeMirrorKeyMap,
      })
    },
    [setSettings]
  )

  const selectIndentType: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorIndentType': event.target
          .value as GeneralEditorIndentType,
      })
    },
    [setSettings]
  )

  const selectIndentSize: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorIndentSize': parseInt(
          event.target.value,
          10
        ) as GeneralEditorIndentSize,
      })
    },
    [setSettings]
  )

  return (
    <Section>
      <SectionHeader3>{t('settings.applicationTheme')}</SectionHeader3>
      <SectionSelect value={settings['general.theme']} onChange={selectTheme}>
        <option value='light'>{t('settings.light')}</option>
        <option value='dark'>{t('settings.dark')}</option>
      </SectionSelect>

      <SectionHeader3>{t('settings.editorTheme')}</SectionHeader3>
      <SectionSelect
        value={settings['general.editorTheme']}
        onChange={selectEditorTheme}
      >
        {codeMirrorEditorThemes.map((val) => (
          <option key={`theme-${val}`} value={val}>
            {val}
          </option>
        ))}
      </SectionSelect>
      <SectionHeader3>{t('settings.codeblockTheme')}</SectionHeader3>
      <SectionSelect
        value={settings['general.codeBlockTheme']}
        onChange={selectCodeBlockTheme}
      >
        {codeMirrorEditorThemes.map((val) => (
          <option key={`theme-${val}`} value={val}>
            {val}
          </option>
        ))}
      </SectionSelect>
      <SectionHeader3>{t('settings.editorKeyMap')}</SectionHeader3>
      <SectionSelect
        value={settings['general.editorKeyMap']}
        onChange={selectEditorKeyMap}
      >
        {codeMirrorKeyMap.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </SectionSelect>
      <SectionHeader3>Editor Indent Type</SectionHeader3>
      <SectionSelect
        value={settings['general.editorIndentType']}
        onChange={selectIndentType}
      >
        <option value='spaces'>Spaces</option>
        <option value='tab'>Tab</option>
      </SectionSelect>
      <SectionHeader3>Editor Indent Size</SectionHeader3>
      <SectionSelect
        value={settings['general.editorIndentSize']}
        onChange={selectIndentSize}
      >
        <option value='8'>8</option>
        <option value='4'>4</option>
        <option value='2'>2</option>
      </SectionSelect>
    </Section>
  )
}

export default UserPreferencesForm

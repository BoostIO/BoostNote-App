import React, { useCallback } from 'react'
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
import SettingSelect from '../../../../shared/components/organisms/Settings/atoms/SettingSelect'

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
    <>
      <section>
        <SettingSelect
          label={t('settings.applicationTheme')}
          value={settings['general.theme']}
          onChange={selectTheme}
          options={
            <>
              <option value='light'>{t('settings.light')}</option>
              <option value='dark'>{t('settings.dark')}</option>
            </>
          }
        ></SettingSelect>
      </section>

      <section>
        <SettingSelect
          label={t('settings.editorTheme')}
          value={settings['general.editorTheme']}
          onChange={selectEditorTheme}
          options={
            <>
              {codeMirrorEditorThemes.map((val) => (
                <option key={`theme-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </>
          }
        ></SettingSelect>
      </section>

      <section>
        <SettingSelect
          label={t('settings.codeblockTheme')}
          value={settings['general.codeBlockTheme']}
          onChange={selectCodeBlockTheme}
          options={
            <>
              {codeMirrorEditorThemes.map((val) => (
                <option key={`theme-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </>
          }
        ></SettingSelect>
      </section>

      <section>
        <SettingSelect
          label={t('settings.editorKeyMap')}
          value={settings['general.editorKeyMap']}
          onChange={selectEditorKeyMap}
          options={
            <>
              {codeMirrorKeyMap.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </>
          }
        ></SettingSelect>
      </section>

      <section>
        <SettingSelect
          label={'Editor Indent Type'}
          value={settings['general.editorIndentType']}
          onChange={selectIndentType}
          options={
            <>
              <option value='spaces'>Spaces</option>
              <option value='tab'>Tab</option>
            </>
          }
        ></SettingSelect>
      </section>

      <section>
        <SettingSelect
          label={'Editor Indent Size'}
          value={settings['general.editorIndentSize']}
          onChange={selectIndentSize}
          options={
            <>
              <option value='8'>8</option>
              <option value='4'>4</option>
              <option value='2'>2</option>
            </>
          }
        ></SettingSelect>
      </section>
    </>
  )
}

export default UserPreferencesForm

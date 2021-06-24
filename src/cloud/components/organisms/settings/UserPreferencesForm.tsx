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
  GeneralLanguageOptions,
} from '../../../lib/stores/settings'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import Form from '../../../../shared/components/molecules/Form'
import FormSelect, {
  FormSelectOption,
} from '../../../../shared/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../shared/components/molecules/Form/templates/FormRow'
import { lngKeys } from '../../../lib/i18n/types'

const UserPreferencesForm = () => {
  const { settings, setSettings } = useSettings()
  const { t } = useTranslation()

  const selectLanguage = useCallback(
    (formOption: FormSelectOption) => {
      setSettings({
        'general.language': formOption.value as GeneralLanguageOptions,
      })
    },
    [setSettings]
  )

  const selectTheme = useCallback(
    (formOption: FormSelectOption) => {
      setSettings({
        'general.theme': formOption.value as GeneralThemeOptions,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeApp, {
        theme: formOption.value,
      })
    },
    [setSettings]
  )

  const selectEditorTheme = useCallback(
    (value: string) => {
      setSettings({
        'general.editorTheme': value as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeEditor, {
        theme: value,
      })
    },
    [setSettings]
  )

  const selectCodeBlockTheme = useCallback(
    (value: string) => {
      setSettings({
        'general.codeBlockTheme': value as CodeMirrorEditorTheme,
      })

      trackEvent(MixpanelActionTrackTypes.ThemeChangeCodeblock, {
        theme: value,
      })
    },
    [setSettings]
  )

  const selectEditorKeyMap = useCallback(
    (value: string) => {
      setSettings({
        'general.editorKeyMap': value as CodeMirrorKeyMap,
      })
    },
    [setSettings]
  )

  const selectIndentType = useCallback(
    (option: FormSelectOption) => {
      setSettings({
        'general.editorIndentType': option.value as GeneralEditorIndentType,
      })
    },
    [setSettings]
  )

  const selectIndentSize = useCallback(
    (value: string) => {
      setSettings({
        'general.editorIndentSize': parseInt(
          value,
          10
        ) as GeneralEditorIndentSize,
      })
    },
    [setSettings]
  )

  return (
    <Form
      rows={[
        {
          title: t(lngKeys.SettingsUILanguage),
          items: [
            {
              type: 'node',
              element: (
                <FormSelect
                  options={[
                    {
                      label: 'English (US)',
                      value: 'en-US',
                    },
                    { label: '日本語', value: 'ja' },
                    { label: 'Français', value: 'fr' },
                  ]}
                  value={{
                    label:
                      settings['general.language'] === 'en-US'
                        ? 'English (US)'
                        : settings['general.language'] === 'fr'
                        ? 'Français'
                        : settings['general.language'] === 'ja'
                        ? '日本語'
                        : '',
                    value: settings['general.language'],
                  }}
                  onChange={selectLanguage}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsApplicationTheme),
          items: [
            {
              type: 'node',
              element: (
                <FormSelect
                  options={[
                    {
                      label: t('settings.light'),
                      value: 'light',
                    },
                    { label: t('settings.dark'), value: 'dark' },
                  ]}
                  value={{
                    label: t(`settings.${settings['general.theme']}`),
                    value: settings['general.theme'],
                  }}
                  onChange={selectTheme}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsEditorTheme),
          items: [
            {
              type: 'select--string',
              props: {
                options: codeMirrorEditorThemes,
                value: settings['general.editorTheme'],
                onChange: selectEditorTheme,
              },
            },
          ],
        },
        {
          title: t(lngKeys.SettingsCodeBlockTheme),
          items: [
            {
              type: 'select--string',
              props: {
                options: codeMirrorEditorThemes,
                value: settings['general.codeBlockTheme'],
                onChange: selectCodeBlockTheme,
              },
            },
          ],
        },
        {
          title: t(lngKeys.SettingsEditorKeyMap),
          items: [
            {
              type: 'select--string',
              props: {
                options: codeMirrorKeyMap,
                value: settings['general.editorKeyMap'],
                onChange: selectEditorKeyMap,
              },
            },
          ],
        },
        {
          title: t(lngKeys.SettingsIndentType),
          items: [
            {
              type: 'select',
              props: {
                value: {
                  label:
                    settings['general.editorIndentType'] === 'spaces'
                      ? t(lngKeys.GeneralSpaces)
                      : t(lngKeys.GeneralTabs),
                  value: settings['general.editorIndentType'],
                },
                onChange: selectIndentType,
                options: [
                  { label: t(lngKeys.GeneralSpaces), value: 'spaces' },
                  { label: t(lngKeys.GeneralTabs), value: 'tab' },
                ],
              },
            },
          ],
        },
      ]}
    >
      <FormRow
        row={{
          title: t(lngKeys.SettingsIndentSize),
          items: [
            {
              type: 'select--string',
              props: {
                options: ['8', '4', '2'],
                value: settings['general.editorIndentSize'].toString(),
                onChange: selectIndentSize,
              },
            },
          ],
        }}
      />
    </Form>
  )
}

export default UserPreferencesForm

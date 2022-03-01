import React, { ChangeEventHandler, useCallback, useState } from 'react'
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
} from '../../lib/stores/settings'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import Form from '../../../design/components/molecules/Form'
import FormSelect, {
  FormSelectOption,
} from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import { lngKeys } from '../../lib/i18n/types'
import { useDebounce } from 'react-use'
import MarkdownTabForm from './MarkdownTabForm'

const UserPreferencesForm = () => {
  const { settings, setSettings } = useSettings()
  const { t } = useTranslation()

  const [fontSize, setFontSize] = useState(
    settings['general.editorFontSize'].toString()
  )
  const [fontFamily, setFontFamily] = useState(
    settings['general.editorFontFamily']
  )

  const resetSettings = useCallback(() => {
    setSettings({})
  }, [setSettings])

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

  const selectShowEditorToolbar = useCallback(
    (formOption: FormSelectOption) => {
      setSettings({
        'general.showEditorToolbar': formOption.value === 'Show',
      })
    },
    [setSettings]
  )

  const selectShowEditorLineNumbers = useCallback(
    (formOption: FormSelectOption) => {
      setSettings({
        'general.editorShowLineNumbers': formOption.value === 'Show',
      })
    },
    [setSettings]
  )

  const selectEnableSpellcheck = useCallback(
    (formOption: FormSelectOption) => {
      setSettings({
        'general.enableSpellcheck': formOption.value === 'Enabled',
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

  const updateFontSize: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFontSize(event.target.value)
    },
    [setFontSize]
  )
  useDebounce(
    () => {
      const parsedFontSize = parseInt(fontSize, 10)
      if (!Number.isNaN(parsedFontSize)) {
        setSettings({
          'general.editorFontSize': parsedFontSize,
        })
      }
    },
    500,
    [fontSize, setSettings]
  )

  const updateFontFamily: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFontFamily(event.target.value)
    },
    [setFontFamily]
  )
  useDebounce(
    () => {
      setSettings({
        'general.editorFontFamily': fontFamily,
      })
    },
    500,
    [fontFamily, setSettings]
  )

  return (
    <Form
      fullWidth={true}
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
                    { label: '汉语', value: 'zh-CN' },
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
                        : settings['general.language'] === 'zh-CN'
                        ? '汉语'
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
                    { label: t('settings.dracula'), value: 'dracula' },
                    {
                      label: t('settings.solarizedDark'),
                      value: 'solarizedDark',
                    },
                    { label: t('settings.sepia'), value: 'sepia' },
                    { label: t('settings.monokai'), value: 'monokai' },
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
          title: t(lngKeys.SettingsEnableEditorSpellcheck),
          items: [
            {
              type: 'node',
              element: (
                <FormSelect
                  options={[
                    {
                      label: t(lngKeys.GeneralEnableVerb),
                      value: 'Enabled',
                    },
                    { label: t(lngKeys.GeneralDisableVerb), value: 'Disabled' },
                  ]}
                  value={{
                    label: settings['general.enableSpellcheck']
                      ? t(lngKeys.GeneralEnableVerb)
                      : t(lngKeys.GeneralDisableVerb),
                    value: settings['general.enableSpellcheck']
                      ? 'Enabled'
                      : 'Disabled',
                  }}
                  onChange={selectEnableSpellcheck}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsShowEditorLineNumbers),
          items: [
            {
              type: 'node',
              element: (
                <FormSelect
                  options={[
                    {
                      label: t(lngKeys.GeneralShowVerb),
                      value: 'Show',
                    },
                    { label: t(lngKeys.GeneralHideVerb), value: 'Hide' },
                  ]}
                  value={{
                    label: settings['general.editorShowLineNumbers']
                      ? t(lngKeys.GeneralShowVerb)
                      : t(lngKeys.GeneralHideVerb),
                    value: settings['general.editorShowLineNumbers']
                      ? 'Show'
                      : 'Hide',
                  }}
                  onChange={selectShowEditorLineNumbers}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsShowEditorToolbar),
          items: [
            {
              type: 'node',
              element: (
                <FormSelect
                  options={[
                    {
                      label: t(lngKeys.GeneralShowVerb),
                      value: 'Show',
                    },
                    { label: t(lngKeys.GeneralHideVerb), value: 'Hide' },
                  ]}
                  value={{
                    label: settings['general.showEditorToolbar']
                      ? t(lngKeys.GeneralShowVerb)
                      : t(lngKeys.GeneralHideVerb),
                    value: settings['general.showEditorToolbar']
                      ? 'Show'
                      : 'Hide',
                  }}
                  onChange={selectShowEditorToolbar}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsEditorFontSize),
          items: [
            {
              type: 'input',
              props: {
                type: 'number',
                value: fontSize,
                onChange: updateFontSize,
              },
            },
          ],
        },
        {
          title: t(lngKeys.SettingsEditorFontFamily),
          items: [
            {
              type: 'input',
              props: {
                type: 'text',
                value: fontFamily,
                onChange: updateFontFamily,
              },
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
        fullWidth={true}
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
      <FormRow
        fullWidth={true}
        row={{
          title:
            t(lngKeys.SettingsMarkdownPreview) +
            ' ' +
            t(lngKeys.SettingsMarkdownPreviewStyleTitle),
          items: [
            {
              type: 'node',
              element: <MarkdownTabForm />,
            },
          ],
        }}
      />
      <FormRow
        fullWidth={true}
        row={{
          title: t(lngKeys.SettingsPreferencesResetTitle),
          items: [
            {
              type: 'button',
              props: {
                variant: 'secondary',
                label: t(lngKeys.SettingsPreferencesResetLabel),
                onClick: () => resetSettings(),
              },
            },
          ],
        }}
      />
    </Form>
  )
}

export default UserPreferencesForm

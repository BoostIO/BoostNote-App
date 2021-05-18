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
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import Form from '../../../../shared/components/molecules/Form'
import FormSelect, {
  FormSelectOption,
  SimpleFormSelect,
} from '../../../../shared/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../shared/components/molecules/Form/layouts/FormRow'

const UserPreferencesForm = () => {
  const { settings, setSettings } = useSettings()
  const { t } = useTranslation()

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
    (value: string) => {
      setSettings({
        'general.editorIndentType': value as GeneralEditorIndentType,
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
          title: t('settings.applicationTheme'),
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
          title: t('settings.editorTheme'),
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
          title: t('settings.codeblockTheme'),
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
          title: t('settings.editorKeyMap'),
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
          title: 'Editor Indent Type',
          items: [
            {
              type: 'node',
              element: (
                <SimpleFormSelect
                  value={settings['general.editorIndentType']}
                  onChange={selectIndentType}
                  options={['spaces', 'tab']}
                />
              ),
            },
          ],
        },
      ]}
    >
      <FormRow
        row={{
          title: 'Editor Indent Size',
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

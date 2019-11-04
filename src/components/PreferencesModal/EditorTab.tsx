import React, { useCallback } from 'react'
import { Section, SectionHeader, SectionControl } from './styled'
import { useTranslation } from 'react-i18next'
import { usePreferences } from '../../lib/preferences'
import { SelectChangeEventHandler } from '../../lib/events'
import { themes } from '../../lib/CodeMirror'
import { capitalize } from '../../lib/string'

const EditorTab = () => {
  const { preferences, setPreferences } = usePreferences()

  const selectEditorTheme: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'editor.theme': event.target.value
      })
    },
    [setPreferences]
  )

  const { t } = useTranslation()
  return (
    <div>
      <Section>
        <SectionHeader>{t('preferences.editorTheme')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['editor.theme']}
            onChange={selectEditorTheme}
          >
            <option value='default'>Default</option>
            {themes.map(theme => (
              <option value={theme} key={theme}>
                {capitalize(theme)}
              </option>
            ))}
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorFontSize')}</SectionHeader>
        <SectionControl>
          <input type='number' />
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorFontFamily')}</SectionHeader>
        <SectionControl>
          <input type='value' />
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorIndentType')}</SectionHeader>
        <SectionControl>
          <select>
            <option>{t('preferences.tab')}</option>
            <option>{t('preferences.spaces')}</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorIndentSize')}</SectionHeader>
        <SectionControl>
          <select>
            <option>2</option>
            <option>4</option>
            <option>8</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorKeymap')}</SectionHeader>
        <SectionControl>
          <select>
            <option>Default</option>
            <option>vim</option>
            <option>emacs</option>
          </select>
        </SectionControl>
      </Section>
    </div>
  )
}

export default EditorTab

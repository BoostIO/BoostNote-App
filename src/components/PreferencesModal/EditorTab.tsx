import React, { useCallback, useState, ChangeEventHandler } from 'react'
import { Section, SectionHeader, SectionControl } from './styled'
import { useTranslation } from 'react-i18next'
import { usePreferences } from '../../lib/preferences'
import { SelectChangeEventHandler } from '../../lib/events'
import { themes } from '../../lib/CodeMirror'
import { capitalize } from '../../lib/string'
import CodeEditor from '../atoms/CodeEditor'
import { useDebounce } from 'react-use'

const defaultPreviewContent = `# hello-world.js

\`\`\`js
function say() {
  console.log('Hello, World!')
}
\`\`\`
`

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

  const [fontSize, setFontSize] = useState(
    preferences['editor.fontSize'].toString()
  )
  const updateFontSize: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setFontSize(event.target.value)
    },
    [setFontSize]
  )

  useDebounce(
    () => {
      const parsedFontSize = parseInt(fontSize, 10)
      if (!Number.isNaN(parsedFontSize)) {
        setPreferences({
          'editor.fontSize': parsedFontSize
        })
      }
    },
    500,
    [fontSize, setPreferences]
  )

  const [fontFamily, setFontFamily] = useState(preferences['editor.fontFamily'])
  const updateFontFamily: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setFontFamily(event.target.value)
    },
    [setFontFamily]
  )

  useDebounce(
    () => {
      setPreferences({
        'editor.fontFamily': fontFamily
      })
    },
    500,
    [fontFamily, setPreferences]
  )

  const [previewContent, setPreviewContent] = useState(defaultPreviewContent)

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
          <input type='number' value={fontSize} onChange={updateFontSize} /> px
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.editorFontFamily')}</SectionHeader>
        <SectionControl>
          <input type='value' value={fontFamily} onChange={updateFontFamily} />
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
      <Section>
        <SectionHeader>{t('preferences.editorPreview')}</SectionHeader>
        <SectionControl>
          <CodeEditor
            value={previewContent}
            onChange={newValue => setPreviewContent(newValue)}
            theme={preferences['editor.theme']}
            fontSize={preferences['editor.fontSize']}
            fontFamily={preferences['editor.fontFamily']}
          />
        </SectionControl>
      </Section>
    </div>
  )
}

export default EditorTab

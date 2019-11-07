import React, { useState, useCallback } from 'react'
import { Section, SectionHeader, SectionControl } from './styled'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { usePreferences } from '../../lib/preferences'
import styled from '../../lib/styled'
import { SelectChangeEventHandler } from '../../lib/events'
import { themes } from '../../lib/CodeMirror'
import { capitalize } from '../../lib/string'
import { useTranslation } from 'react-i18next'

const defaultPreviewContent = `# hello-world.js

\`\`\`js
function say() {
  console.log('Hello, World!')
}
\`\`\`
`
const PreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
  .panel {
    width: 50%;
  }
`

const MarkdownTab = () => {
  const { preferences, setPreferences } = usePreferences()

  const selectCodeFenceTheme: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'markdown.codeBlockTheme': event.target.value
      })
    },
    [setPreferences]
  )

  const [previewContent, setPreviewContent] = useState(defaultPreviewContent)
  const updatePreviewContent = useCallback(
    newValue => {
      setPreviewContent(newValue)
    },
    [setPreviewContent]
  )

  const { t } = useTranslation()

  return (
    <div>
      <Section>
        <SectionHeader>{t('preferences.markdownCodeBlockTheme')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['markdown.codeBlockTheme']}
            onChange={selectCodeFenceTheme}
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
        <SectionHeader>Markdown Preview</SectionHeader>
        <PreviewContainer>
          <div className='panel'>
            <CustomizedCodeEditor
              value={previewContent}
              onChange={updatePreviewContent}
            />
          </div>
          <div className='panel'>
            <CustomizedMarkdownPreviewer content={previewContent} />
          </div>
        </PreviewContainer>
      </Section>
    </div>
  )
}

export default MarkdownTab

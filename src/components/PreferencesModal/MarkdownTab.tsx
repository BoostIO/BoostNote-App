import React, { useState, useCallback } from 'react'
import {
  Section,
  SectionHeader,
  SectionControl,
  SectionPrimaryButton,
  SectionSecondaryButton,
  SectionSelect
} from './styled'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { usePreferences } from 'Lib/preferences'
import styled from 'Lib/styled'
import { SelectChangeEventHandler } from 'Lib/events'
import { themes } from 'Lib/CodeMirror'
import { capitalize } from 'Lib/string'
import { useTranslation } from 'react-i18next'
import { usePreviewStyle, defaultPreviewStyle } from 'Lib/preview'
import { borderRight, border } from 'Lib/styled/styleFunctions'

const EditorContainer = styled.div`
  ${border}
`

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
  ${border}
  .panel {
    width: 50%;
    &:first-child {
      ${borderRight}
    }
  }
`

const MarkdownTab = () => {
  const { previewStyle, setPreviewStyle } = usePreviewStyle()
  const [newPreviewStyle, setNewPreviewStyle] = useState(previewStyle)
  const updatePreviewStyle = useCallback(
    (newValue: string) => {
      setNewPreviewStyle(newValue)
    },
    [setNewPreviewStyle]
  )
  const savePreviewStyle = useCallback(() => {
    if (previewStyle !== newPreviewStyle) {
      setPreviewStyle(newPreviewStyle)
    }
  }, [setPreviewStyle, newPreviewStyle, previewStyle])

  const resetNewPreviewStyle = useCallback(() => {
    setNewPreviewStyle(defaultPreviewStyle)
  }, [setNewPreviewStyle])

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
        <SectionHeader>{t('preferences.previewStyle')}</SectionHeader>
        <SectionControl>
          <SectionPrimaryButton onClick={savePreviewStyle}>
            {t('general.save')}
          </SectionPrimaryButton>
          <SectionSecondaryButton onClick={resetNewPreviewStyle}>
            {t('preferences.defaultTheme')}
          </SectionSecondaryButton>
        </SectionControl>
        <EditorContainer>
          <CustomizedCodeEditor
            value={newPreviewStyle}
            onChange={updatePreviewStyle}
            mode='css'
          />
        </EditorContainer>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.markdownCodeBlockTheme')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['markdown.codeBlockTheme']}
            onChange={selectCodeFenceTheme}
          >
            <option value='default'>{t('general.default')}</option>
            {themes.map(theme => (
              <option value={theme} key={theme}>
                {capitalize(theme)}
              </option>
            ))}
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.markdownPreview')}</SectionHeader>
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

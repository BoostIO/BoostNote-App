import React, { useState, useCallback } from 'react'
import { SectionHeader } from './styled'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { usePreferences } from '../../lib/preferences'
import { themes } from '../../lib/CodeMirror'
import { useTranslation } from 'react-i18next'
import { usePreviewStyle, defaultPreviewStyle } from '../../lib/preview'
import styled from '../../shared/lib/styled'
import { border, borderRight } from '../../shared/lib/styled/styleFunctions'
import { SimpleFormSelect } from '../../shared/components/molecules/Form/atoms/FormSelect'
import Form from '../../shared/components/molecules/Form'

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
    padding: 15px;

    &:first-child {
      ${borderRight}
    }
  }
`

const MarkdownTab = () => {
  const { previewStyle, setPreviewStyle } = usePreviewStyle()
  const { t } = useTranslation()
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

  const selectCodeFenceTheme = useCallback(
    (codeBlockTheme) => {
      setPreferences({
        'markdown.codeBlockTheme': codeBlockTheme,
      })
    },
    [setPreferences]
  )

  const [previewContent, setPreviewContent] = useState(defaultPreviewContent)
  const updatePreviewContent = useCallback(
    (newValue) => {
      setPreviewContent(newValue)
    },
    [setPreviewContent]
  )

  return (
    <div>
      <SectionHeader>{t('preferences.markdownTab')}</SectionHeader>
      <Form
        fullWidth={true}
        rows={[
          {
            title: t('preferences.previewStyle'),
            items: [
              {
                type: 'button',
                props: {
                  label: t('general.save'),
                  onClick: () => savePreviewStyle(),
                },
              },
              {
                type: 'button',
                props: {
                  variant: 'secondary',
                  label: t('preferences.defaultTheme'),
                  onClick: () => resetNewPreviewStyle(),
                },
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <EditorContainer>
                    <CustomizedCodeEditor
                      value={newPreviewStyle}
                      onChange={updatePreviewStyle}
                      mode='css'
                    />
                  </EditorContainer>
                ),
              },
            ],
          },
          {
            title: t('preferences.markdownCodeBlockTheme'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['markdown.codeBlockTheme']}
                    onChange={selectCodeFenceTheme}
                    options={['default', ...themes.map((theme) => theme)]}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.markdownPreview'),
            items: [
              {
                type: 'node',
                element: (
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
                ),
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default MarkdownTab

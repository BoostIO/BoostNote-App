import React, { useState, useCallback, useMemo, useRef } from 'react'
import styled from '../../../design/lib/styled'
import { border, borderRight } from '../../../design/lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import {
  CodeMirrorEditorTheme,
  codeMirrorEditorThemes,
  useSettings,
} from '../../lib/stores/settings'
import {
  defaultCustomizablePreviewStyle,
  usePreviewStyle,
} from '../../../lib/preview'
import Form from '../../../design/components/molecules/Form'
import CodeMirrorEditor from '../../lib/editor/components/CodeMirrorEditor'
import { SimpleFormSelect } from '../../../design/components/molecules/Form/atoms/FormSelect'
import CodeMirror from 'codemirror'
import { lngKeys } from '../../lib/i18n/types'
import { osName } from '../../../design/lib/platform'
import CustomizedMarkdownPreviewer from '../MarkdownView/CustomizedMarkdownPreviewer'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { useDebounce } from 'react-use'

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

    z-index: 0;
  }

  .CodeMirrorWrapper,
  .CodeMirror-wrap {
    height: 100%;
    min-height: 360px;
    max-height: 360px;
  }
`

const PREVIEW_STYLE_INPUT_DEBOUNCE_MS = 1000

const MarkdownTabForm = () => {
  const { settings, setSettings } = useSettings()
  const { previewStyle, setPreviewStyle } = usePreviewStyle()
  const [newPreviewStyle, setNewPreviewStyle] = useState(previewStyle)
  const [previewContent, setPreviewContent] = useState(defaultPreviewContent)
  const initialPreviewStyle = useRef<string>(previewStyle)
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const { t } = useTranslation()

  useDebounce(
    () => {
      if (editorRef.current == null) {
        return
      }

      const newPreviewStyleFromEditor = editorRef.current.getValue()
      if (previewStyle !== newPreviewStyleFromEditor) {
        setPreviewStyle(newPreviewStyleFromEditor)
      }
    },
    PREVIEW_STYLE_INPUT_DEBOUNCE_MS,
    [editorRef, newPreviewStyle]
  )

  const resetNewPreviewStyle = useCallback(() => {
    if (editorRef.current != null) {
      editorRef.current.setValue(defaultCustomizablePreviewStyle)
    }
  }, [])

  const selectCodeBlockTheme = useCallback(
    (codeBlockTheme: string) => {
      setSettings({
        'general.codeBlockTheme': codeBlockTheme as CodeMirrorEditorTheme,
      })

      trackEvent(MixpanelActionTrackTypes.ThemeChangeCodeblock, {
        theme: codeBlockTheme,
      })
    },
    [setSettings]
  )

  const bindCodeMirrorEditorPreviewContent = useCallback(
    (editor: CodeMirror.Editor) => {
      editor.on('change', (instance) => {
        setPreviewContent(instance.getValue())
      })
    },
    []
  )

  const bindCodeMirrorEditorPreviewStyle = useCallback(
    (editor: CodeMirror.Editor) => {
      editorRef.current = editor
      editor.setValue(initialPreviewStyle.current)
      editor.on('change', (instance) => {
        setNewPreviewStyle(instance.getValue())
      })
    },
    []
  )

  const editorConfigPreview: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme === 'solarized-dark'
        ? 'solarized dark'
        : editorTheme
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']

    return {
      mode: 'css',
      lineNumbers: true,
      lineWrapping: true,
      theme,
      indentWithTabs: editorIndentType === 'tab',
      indentUnit: editorIndentSize,
      tabSize: editorIndentSize,
      inputStyle: osName === 'android' ? 'textarea' : 'contenteditable',
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'indentMore',
      },
      scrollPastEnd: true,
    }
  }, [settings])

  const editorConfigMarkdownPreview: CodeMirror.EditorConfiguration =
    useMemo(() => {
      const editorTheme = settings['general.editorTheme']
      const theme =
        editorTheme == null || editorTheme === 'default'
          ? settings['general.theme'] === 'light'
            ? 'default'
            : 'material-darker'
          : editorTheme === 'solarized-dark'
          ? 'solarized dark'
          : editorTheme
      const editorIndentType = settings['general.editorIndentType']
      const editorIndentSize = settings['general.editorIndentSize']

      return {
        value: defaultPreviewContent,
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme,
        indentWithTabs: editorIndentType === 'tab',
        indentUnit: editorIndentSize,
        tabSize: editorIndentSize,
        inputStyle: osName === 'android' ? 'textarea' : 'contenteditable',
        extraKeys: {
          Enter: 'newlineAndIndentContinueMarkdownList',
          Tab: 'indentMore',
        },
        scrollPastEnd: true,
      }
    }, [settings])

  return (
    <Form
      fullWidth={true}
      rows={[
        {
          items: [
            {
              type: 'button',
              props: {
                variant: 'secondary',
                label: t(lngKeys.SettingsMarkdownPreviewStyleResetLabel),
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
                  <CodeMirrorEditor
                    config={editorConfigPreview}
                    bind={bindCodeMirrorEditorPreviewStyle}
                  />
                </EditorContainer>
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsMarkdownPreviewCodeBlockTheme),
          items: [
            {
              type: 'node',
              element: (
                <SimpleFormSelect
                  id='markdownThemeSelect'
                  className='menu__item__select'
                  value={settings['general.codeBlockTheme']}
                  onChange={selectCodeBlockTheme}
                  options={codeMirrorEditorThemes}
                />
              ),
            },
          ],
        },
        {
          title: t(lngKeys.SettingsMarkdownPreviewShowcase),
          items: [
            {
              type: 'node',
              element: (
                <PreviewContainer>
                  <div className='panel'>
                    <CodeMirrorEditor
                      config={editorConfigMarkdownPreview}
                      bind={bindCodeMirrorEditorPreviewContent}
                    />
                  </div>
                  <MarkdownPreviewerPanel className={'panel'}>
                    <div className='preview'>
                      <CustomizedMarkdownPreviewer
                        content={previewContent}
                        headerLinks={false}
                        codeFence={false}
                      />
                    </div>
                  </MarkdownPreviewerPanel>
                </PreviewContainer>
              ),
            },
          ],
        },
      ]}
    />
  )
}

const MarkdownPreviewerPanel = styled.div`
  overflow: auto;
  text-overflow: ellipsis;
  white-space: nowrap;

  max-width: 360px;
  max-height: 360px;
  min-height: 360px;
  height: 100%;
`

export default MarkdownTabForm

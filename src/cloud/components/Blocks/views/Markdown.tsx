import React, { useState, useMemo, useCallback, useRef } from 'react'
import styled from '../../../../design/lib/styled'
import { MarkdownBlock } from '../../../api/blocks'
import CodeMirrorEditor from '../../../lib/editor/components/CodeMirrorEditor'
import { CodeMirrorKeyMap, useSettings } from '../../../lib/stores/settings'
import { ViewProps } from '../BlockContent'
import MarkdownPreview from '../../MarkdownView'

const MarkdownView = ({ block }: ViewProps<MarkdownBlock>) => {
  const [mode, setMode] = useState<'editor' | 'view'>()
  const [editorContent, setEditorContent] = useState('')
  const editorRef = useRef<CodeMirror.Editor | null>(null)
  const { settings } = useSettings()
  const editorConfig: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme === 'solarized-dark'
        ? 'solarized dark'
        : editorTheme
    const keyMap = resolveKeyMap(settings['general.editorKeyMap'])
    const editorIndentType = settings['general.editorIndentType']
    const editorIndentSize = settings['general.editorIndentSize']

    return {
      mode: 'markdown',
      lineNumbers: true,
      lineWrapping: true,
      theme,
      indentWithTabs: editorIndentType === 'tab',
      indentUnit: editorIndentSize,
      tabSize: editorIndentSize,
      keyMap,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'indentMore',
      },
    }
  }, [settings])

  const bindCallback = useCallback((editor: CodeMirror.Editor) => {
    setEditorContent(editor.getValue())
    editorRef.current = editor
    editorRef.current.on('blue', () => setMode('view'))
  }, [])

  return (
    <StyledMarkdownView className={`block__markdown--mode-${mode}`}>
      <CodeMirrorEditor bind={bindCallback} config={editorConfig} />
      <div
        onClick={() => setMode('editor')}
        className='block__markdown--preview'
      >
        <MarkdownPreview content={editorContent} />
      </div>
    </StyledMarkdownView>
  )
}

const StyledMarkdownView = styled.div`
  position: relative;
  & > .block__markdown--preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  &.block__markdown--mode-editor {
    & > .block__markdown--preview {
      display: none;
    }
  }
`

function resolveKeyMap(keyMap: CodeMirrorKeyMap) {
  switch (keyMap) {
    case 'vim':
      return 'vim'
    case 'default':
    default:
      return 'sublime'
  }
}
export default MarkdownView

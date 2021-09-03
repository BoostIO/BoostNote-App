import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import styled from '../../../../design/lib/styled'
import { MarkdownBlock } from '../../../api/blocks'
import CodeMirrorEditor from '../../../lib/editor/components/CodeMirrorEditor'
import { CodeMirrorKeyMap, useSettings } from '../../../lib/stores/settings'
import { ViewProps } from './'
import MarkdownPreview from '../../MarkdownView'
import { CodemirrorBinding } from 'y-codemirror'
import Spinner from '../../../../design/components/atoms/Spinner'
import Icon from '../../../../design/components/atoms/Icon'
import { mdiEyeOutline, mdiPencil } from '@mdi/js'

const MarkdownView = ({ block, realtime }: ViewProps<MarkdownBlock>) => {
  const [mode, setMode] = useState<'editor' | 'view'>('view')
  const [editorContent, setEditorContent] = useState('')
  const [synced, setSynced] = useState(realtime.synced)
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

  useEffect(() => {
    realtime.on('sync', setSynced)
    return () => realtime.off('sync', setSynced)
  }, [realtime])

  const bindCallback = useCallback(
    (editor: CodeMirror.Editor) => {
      setEditorContent(editor.getValue())
      editorRef.current = editor
      editor.on('change', (instance) => {
        setEditorContent(instance.getValue())
      })
      editor.setValue('')
      new CodemirrorBinding(
        realtime.doc.getText(block.id),
        editorRef.current,
        realtime.awareness
      )
      editorRef.current.clearHistory()
    },
    [block.id, realtime]
  )

  const toggleMode = useCallback(() => {
    setMode((mode) => (mode === 'view' ? 'editor' : 'view'))
    editorRef.current && editorRef.current.refresh()
  }, [])

  if (!synced) {
    return (
      <StyledMarkdownView className='block__markdown--mode-loading'>
        <Spinner />
      </StyledMarkdownView>
    )
  }

  return (
    <StyledMarkdownView className={`block__markdown--mode-${mode}`}>
      <div className='block__markdown--toolbar' onClick={toggleMode}>
        <Icon path={mode === 'view' ? mdiPencil : mdiEyeOutline} size={16} />
      </div>
      <div className='block__markdown--editor'>
        <CodeMirrorEditor bind={bindCallback} config={editorConfig} />
      </div>
      <MarkdownPreview
        className='block__markdown--preview'
        content={editorContent}
      />
    </StyledMarkdownView>
  )
}

const StyledMarkdownView = styled.div`
  position: relative;
  min-height: 20px;

  &:hover .block__markdown--toolbar {
    display: block;
  }

  & .block__markdown--toolbar {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1000;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;

    & svg {
      cursor: pointer;
    }
  }

  & > .block__markdown--preview {
    background-color: ${({ theme }) => theme.colors.background.primary};
    padding: 0;
  }

  &.block__markdown--mode-editor {
    & > .block__markdown--preview {
      display: none;
    }
  }

  &.block__markdown--mode-view {
    & > .block__markdown--editor {
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

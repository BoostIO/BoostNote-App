import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import styled from '../../../../design/lib/styled'
import { MarkdownBlock } from '../../../api/blocks'
import CodeMirrorEditor from '../../../lib/editor/components/CodeMirrorEditor'
import { CodeMirrorKeyMap, useSettings } from '../../../lib/stores/settings'
import { ViewProps } from './'
import MarkdownPreview from '../../MarkdownView'
import { CodemirrorBinding } from 'y-codemirror'
import Spinner from '../../../../design/components/atoms/Spinner'
import { mdiEyeOutline, mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import { getBlockDomId } from '../../../lib/blocks/dom'
import cc from 'classcat'
import BlockLayout from '../BlockLayout'
import {
  MarkdownBlockEventDetails,
  markdownBlockEventEmitter,
} from '../../../lib/utils/events'

const MarkdownView = ({
  block,
  realtime,
  actions,
  currentUserIsCoreMember,
}: ViewProps<MarkdownBlock>) => {
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
  }, [])

  useEffect(() => {
    realtime.on('sync', setSynced)
    return () => realtime.off('sync', setSynced)
  }, [realtime])

  useEffect(() => {
    if (mode === 'editor' && editorRef.current != null) {
      editorRef.current.refresh()
      editorRef.current.focus()
    }
  }, [mode])

  useEffect(() => {
    const handler = ({ detail }: CustomEvent<MarkdownBlockEventDetails>) => {
      if (detail.id !== block.id) {
        return
      }

      switch (detail.type) {
        case 'edit':
          setMode('editor')
          return
        case 'view':
          setMode('view')
        default:
          return
      }
    }
    markdownBlockEventEmitter.listen(handler)
    return () => markdownBlockEventEmitter.unlisten(handler)
  }, [block])

  return (
    <BlockLayout
      controls={
        currentUserIsCoreMember
          ? [
              {
                iconPath: mode === 'view' ? mdiPencil : mdiEyeOutline,
                onClick: toggleMode,
              },
              {
                iconPath: mdiTrashCanOutline,
                onClick: () => actions.remove(block),
              },
            ]
          : undefined
      }
    >
      <StyledMarkdownView
        className={cc([
          !synced
            ? 'block__markdown--mode-loading'
            : `block__markdown--mode-${mode}`,
        ])}
        id={getBlockDomId(block)}
        onEv
        onFocus={() => setMode('editor')}
      >
        {!synced ? (
          <Spinner />
        ) : (
          <>
            <div className='block__markdown--editor'>
              <CodeMirrorEditor bind={bindCallback} config={editorConfig} />
            </div>
            <MarkdownPreview
              className='block__markdown--preview'
              content={editorContent}
            />
          </>
        )}
      </StyledMarkdownView>
    </BlockLayout>
  )
}

const StyledMarkdownView = styled.div`
  position: relative;
  min-height: 20px;

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

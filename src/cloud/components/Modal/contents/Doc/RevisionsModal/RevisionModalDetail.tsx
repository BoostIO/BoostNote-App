import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { format } from 'date-fns'
import Button from '../../../../../../design/components/atoms/Button'
import styled from '../../../../../../design/lib/styled'
import { useSettings } from '../../../../../lib/stores/settings'
import Flexbox from '../../../../../../design/components/atoms/Flexbox'
import CodeMirrorEditor from '../../../../../lib/editor/components/CodeMirrorEditor'
import Scroller from '../../../../../../design/components/atoms/Scroller'
import cc from 'classcat'
import CodeMirror from 'codemirror'
import { SerializedUser } from '../../../../../interfaces/db/user'

interface RevisionModalDetailProps {
  revisionCreatedAt: Date | string
  revisionCreators?: SerializedUser[]
  revisionContent: string
  revisionDiff: string
  onRestoreClick: (revisionContent: string) => void
  scrollbarStyle?: 'native' | 'transparent'
}

const RevisionModalDetail = ({
  revisionCreatedAt,
  revisionCreators,
  revisionContent,
  revisionDiff,
  onRestoreClick,
  scrollbarStyle = 'native',
}: RevisionModalDetailProps) => {
  const { settings } = useSettings()
  const revisionEditorRef = useRef<CodeMirror.Editor | null>(null)

  const editorConfig: CodeMirror.EditorConfiguration = useMemo(() => {
    const editorTheme = settings['general.editorTheme']
    const theme =
      editorTheme == null || editorTheme === 'default'
        ? settings['general.theme'] === 'light'
          ? 'default'
          : 'material-darker'
        : editorTheme

    return {
      mode: 'diff',
      lineNumbers: true,
      lineWrapping: true,
      theme,
      indentWithTabs: false,
      indentUnit: 2,
      tabSize: 2,
      readOnly: true,
    }
  }, [settings])

  useEffect(() => {
    const editor = revisionEditorRef.current
    if (editor == null) {
      return
    }

    const numberOfLines = editor.lineCount()
    for (let lineIndex = 0; lineIndex < numberOfLines; lineIndex++) {
      const line = editor.getLine(lineIndex)
      if (line == null || !(line.startsWith('+') || line.startsWith('-'))) {
        continue
      }

      const revisionLineClassName = line.startsWith('+')
        ? 'revision__line__background-addition'
        : 'revision__line__background-deletion'
      editor.addLineClass(lineIndex, 'background', revisionLineClassName)
      editor.addLineClass(lineIndex, 'gutter', revisionLineClassName)
    }
  }, [revisionDiff])

  const bindRevisionCodeMirrorRef = useCallback((editor) => {
    if (editor == null) {
      return
    }
    revisionEditorRef.current = editor
  }, [])

  return (
    <Container
      className={cc([
        'revision__modal__detail',
        `revision__modal__scroll--${scrollbarStyle}`,
      ])}
    >
      <Flexbox
        alignItems='baseline'
        justifyContent='space-between'
        className='revision__detail__header'
      >
        <Flexbox
          direction='column'
          flex='1 1 auto'
          className='revision__detail__title'
          justifyContent='flex-start'
          alignItems='baseline'
        >
          <h3>
            Updated at {format(new Date(revisionCreatedAt), 'HH:mm, dd MMMM u')}
          </h3>
          {revisionCreators != null && revisionCreators.length > 0 && (
            <span>
              by {revisionCreators.map((user) => user.displayName).join(',')}
            </span>
          )}
        </Flexbox>
        {onRestoreClick != null && (
          <Button
            variant='primary'
            className='restore__btn'
            onClick={() => onRestoreClick(revisionContent)}
          >
            Restore
          </Button>
        )}
      </Flexbox>
      {scrollbarStyle === 'native' ? (
        <CodeMirrorEditor
          config={{
            ...editorConfig,
            value: revisionDiff,
          }}
          bind={bindRevisionCodeMirrorRef}
        />
      ) : (
        <Scroller className='codemirror__scroller'>
          <CodeMirrorEditor
            config={{
              ...editorConfig,
              value: revisionDiff,
            }}
            bind={bindRevisionCodeMirrorRef}
          />
        </Scroller>
      )}
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .revision__detail__header {
    flex: 0 0 auto;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
  }

  .revision__detail__title {
    padding-left: ${({ theme }) => theme.sizes.spaces.df}px;

    h3 {
      margin: 0;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    }

    span {
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  &.revision__modal__scroll--transparent {
    .codemirror__scroller {
      flex: 1 1 auto;
    }

    .CodeMirror {
      height: fit-content;
    }

    .CodeMirror-vscrollbar {
      display: none;
    }
  }

  &.revision__modal__scroll--native {
    .CodeMirrorWrapper {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
    }

    .CodeMirror {
      flex: 1 1 auto;
    }
  }

  .cm-error {
    background-color: unset !important;
  }

  .CodeMirror-linenumber {
    color: ${({ theme }) => theme.colors.text.primary} !important;
  }

  .cm-positive,
  .cm-negative {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .revision__line__background-addition {
    background-color: rgba(0, 200, 81, 0.2); // success with 0.2 alpha
  }

  .revision__line__background-deletion {
    background-color: rgba(139, 38, 53, 0.2); // danger with 0.2 alpha
  }
`

export default RevisionModalDetail

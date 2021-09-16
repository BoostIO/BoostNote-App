import React, { useMemo } from 'react'
import { SerializedRevision } from '../../../../../interfaces/db/revision'
import { format } from 'date-fns'
import Button from '../../../../../../design/components/atoms/Button'
import styled from '../../../../../../design/lib/styled'
import { useSettings } from '../../../../../lib/stores/settings'
import Flexbox from '../../../../../../design/components/atoms/Flexbox'
import CodeMirrorEditor from '../../../../../lib/editor/components/CodeMirrorEditor'
import Scroller from '../../../../../../design/components/atoms/Scroller'
import cc from 'classcat'
import CodeMirror from 'codemirror'

interface RevisionModalDetailProps {
  revision: SerializedRevision
  revisionDiff: string
  onRestoreClick: (rev: SerializedRevision) => void
  restoreRevision?: (rev: SerializedRevision) => void
  scrollbarStyle?: 'native' | 'transparent'
}

const RevisionModalDetail = ({
  revision,
  revisionDiff,
  onRestoreClick,
  restoreRevision,
  scrollbarStyle = 'native',
}: RevisionModalDetailProps) => {
  const { settings } = useSettings()
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
            Updated at {format(new Date(revision.created), 'HH:mm, dd MMMM u')}
          </h3>
          <span>
            {revision.creators.length === 0 ? (
              <i>unknown</i>
            ) : (
              <>
                by {revision.creators.map((user) => user.displayName).join(',')}
              </>
            )}
          </span>
        </Flexbox>
        {restoreRevision != null && (
          <Button
            variant='primary'
            className='restore__btn'
            onClick={() => onRestoreClick(revision)}
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
        />
      ) : (
        <Scroller className='codemirror__scroller'>
          <CodeMirrorEditor
            config={{
              ...editorConfig,
              value: revisionDiff,
            }}
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
`

export default RevisionModalDetail

import React, { useMemo } from 'react'
import { SerializedRevision } from '../../../../../../interfaces/db/revision'
import { format } from 'date-fns'
import { useSettings } from '../../../../../../lib/stores/settings'
import {
  StyledHeader,
  StyledHeaderTitle,
  StyledHeaderDescription,
  MarkdownWrapper,
} from './styled'
import CodeMirrorEditor from '../../../../../../lib/editor/components/CodeMirrorEditor'
import Button from '../../../../../../../shared/components/atoms/Button'
import styled from '../../../../../../../shared/lib/styled'

interface RevisionModalDetailProps {
  rev: SerializedRevision
  onRestoreClick: (rev: SerializedRevision) => void
  restoreRevision?: (rev: SerializedRevision) => void
}

const RevisionModalDetail = ({
  rev,
  onRestoreClick,
  restoreRevision,
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
      mode: 'markdown',
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
    <Container>
      <StyledHeader className='align-left'>
        <StyledHeaderTitle>
          Updated at {format(new Date(rev.created), 'HH:mm, dd MMMM u')}
        </StyledHeaderTitle>
        <StyledHeaderDescription>
          {rev.creators.length === 0 ? (
            <i>unknown</i>
          ) : (
            <>by {rev.creators.map((user) => user.displayName).join(',')}</>
          )}
        </StyledHeaderDescription>
        {restoreRevision != null && (
          <Button
            variant='primary'
            className='restore__btn'
            onClick={() => onRestoreClick(rev)}
          >
            Restore
          </Button>
        )}
      </StyledHeader>
      <MarkdownWrapper>
        <CodeMirrorEditor
          config={{
            ...editorConfig,
            value: rev.content,
          }}
        />
      </MarkdownWrapper>
    </Container>
  )
}

const Container = styled.div`
  .restore__btn {
    position: absolute;
    right: 1px;
    top: 20px;
  }
`

export default RevisionModalDetail

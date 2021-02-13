import React, { useMemo } from 'react'
import { SerializedRevision } from '../../../../../../interfaces/db/revision'
import { format } from 'date-fns'
import CustomButton from '../../../../../atoms/buttons/CustomButton'
import { useSettings } from '../../../../../../lib/stores/settings'
import {
  StyledHeader,
  StyledHeaderTitle,
  StyledHeaderDescription,
  MarkdownWrapper,
  StyledRevisionTitle,
} from './styled'
import CodeMirrorEditor from '../../../../../../lib/editor/components/CodeMirrorEditor'

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
    <>
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
          <CustomButton
            variant='primary'
            style={{ position: 'absolute', right: 60, top: 20 }}
            onClick={() => onRestoreClick(rev)}
          >
            Restore
          </CustomButton>
        )}
      </StyledHeader>
      <StyledRevisionTitle>{rev.title}</StyledRevisionTitle>
      <MarkdownWrapper>
        <CodeMirrorEditor
          config={{
            ...editorConfig,
            value: rev.content,
          }}
        />
      </MarkdownWrapper>
    </>
  )
}

export default RevisionModalDetail

import React, { useCallback } from 'react'
import { NoteDoc } from '../../../lib/db/types'
import { mdiTrashCan, mdiViewSplitVertical, mdiNoteText, mdiXml } from '@mdi/js'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'
import Toolbar from '../../atoms/Toolbar'
import ToolbarSeparator from '../../atoms/ToolbarSeparator'
import ToolbarButtonGroup from '../../atoms/ToolbarButtonGroup'

interface NoteDetailToolbarProps {
  note: NoteDoc
  mode: 'edit' | 'preview' | 'split'
  selectMode: (mode: 'edit' | 'preview' | 'split') => void
  removeNote: () => void | Promise<void>
}

const NoteDetailToolbar = ({
  mode,
  selectMode,
  removeNote
}: NoteDetailToolbarProps) => {
  const selectEditMode = useCallback(() => {
    selectMode('edit')
  }, [selectMode])

  const selectPreviewMode = useCallback(() => {
    selectMode('preview')
  }, [selectMode])

  const selectSplitMode = useCallback(() => {
    selectMode('split')
  }, [selectMode])

  return (
    <Toolbar>
      <ToolbarButtonGroup>
        <ToolbarIconButton
          active={mode === 'edit'}
          onClick={selectEditMode}
          path={mdiXml}
        />
        <ToolbarIconButton
          active={mode === 'preview'}
          onClick={selectPreviewMode}
          path={mdiNoteText}
        />
        <ToolbarIconButton
          active={mode === 'split'}
          onClick={selectSplitMode}
          path={mdiViewSplitVertical}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />
      <ToolbarIconButton onClick={removeNote} path={mdiTrashCan} />
    </Toolbar>
  )
}

export default NoteDetailToolbar

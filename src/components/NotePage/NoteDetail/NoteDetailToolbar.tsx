import React, { useCallback } from 'react'
import { NoteDoc } from '../../../lib/db/types'
import {
  mdiTrashCan,
  mdiViewSplitVertical,
  mdiNoteText,
  mdiPencil
} from '@mdi/js'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'

interface NoteDetailToolbarProps {
  note: NoteDoc
  mode: 'edit' | 'preview' | 'split'
  selectMode: (mode: 'edit' | 'preview' | 'split') => void
  removeNote: () => void | Promise<void>
}

const NoteDetailToolbar = ({
  mode,
  note,
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
    <div>
      <ToolbarIconButton
        active={mode === 'edit'}
        onClick={selectEditMode}
        path={mdiPencil}
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

      <ToolbarIconButton onClick={removeNote} path={mdiTrashCan} />
    </div>
  )
}

export default NoteDetailToolbar

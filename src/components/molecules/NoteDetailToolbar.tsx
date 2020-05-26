import React, { useMemo } from 'react'
import styled from '../../lib/styled'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import {
  mdiTextSubject,
  mdiCodeTags,
  mdiViewSplitVertical,
  mdiTrashCan,
  mdiRestore,
} from '@mdi/js'
import { borderBottom, flexCenter } from '../../lib/styled/styleFunctions'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import ToolbarExportButton from '../atoms/ToolbarExportButton'
import { ViewModeType } from '../../lib/generalStatus'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import NoteDetailFolderNavigator from './NoteDetailFolderNavigator'
import NoteDetailTagNavigator from './NoteDetailTagNavigator'
import { values } from '../../lib/db/utils'

const NoteDetailToolbarContainer = styled.div`
  display: flex;
  height: 40px;
  padding: 0 8px;
  ${borderBottom}
  align-items: center;
`

const Control = styled.div`
  ${flexCenter}
`

interface NoteDetailToolbarProps {
  storage: NoteStorage
  note: NoteDoc
  tags: string[]
  viewMode: ViewModeType
  selectViewMode: (mode: ViewModeType) => void
  trashNote: () => void
  untrashNote: () => void
  purgeNote: () => void
  appendTagByName: (tagName: string) => void
  removeTagByName: (tagName: string) => void
}

const NoteDetailToolbar = ({
  storage,
  note,
  tags,
  viewMode,
  selectViewMode,
  trashNote,
  untrashNote,
  purgeNote,
  appendTagByName,
  removeTagByName,
}: NoteDetailToolbarProps) => {
  const storageTags = useMemo(() => {
    if (storage == null) return []
    return values(storage.tagMap).map((tag) => tag.name)
  }, [storage])

  const storageId = storage.id
  const storageName = storage.name
  return (
    <NoteDetailToolbarContainer>
      <NoteDetailFolderNavigator
        storageId={storageId}
        storageName={storageName}
        noteId={note._id}
        noteFolderPathname={note.folderPathname}
      />
      <ToolbarSeparator />
      <NoteDetailTagNavigator
        storageId={storageId}
        storageTags={storageTags}
        noteId={note._id}
        tags={tags}
        appendTagByName={appendTagByName}
        removeTagByName={removeTagByName}
      />
      <Control>
        <ToolbarIconButton
          active={viewMode === 'edit'}
          onClick={() => selectViewMode('edit')}
          iconPath={mdiCodeTags}
        />
        <ToolbarIconButton
          active={viewMode === 'split'}
          onClick={() => selectViewMode('split')}
          iconPath={mdiViewSplitVertical}
        />
        <ToolbarIconButton
          active={viewMode === 'preview'}
          onClick={() => selectViewMode('preview')}
          iconPath={mdiTextSubject}
        />
        <ToolbarSeparator />
        {note.trashed ? (
          <>
            <ToolbarIconButton onClick={untrashNote} iconPath={mdiRestore} />
            <ToolbarIconButton onClick={purgeNote} iconPath={mdiTrashCan} />
          </>
        ) : (
          <ToolbarIconButton onClick={trashNote} iconPath={mdiTrashCan} />
        )}
        <ToolbarExportButton note={note} />
      </Control>
    </NoteDetailToolbarContainer>
  )
}

export default NoteDetailToolbar

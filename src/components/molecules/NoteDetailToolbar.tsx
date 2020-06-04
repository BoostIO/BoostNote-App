import React, { useMemo, useCallback } from 'react'
import styled from '../../lib/styled'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import {
  mdiTextSubject,
  mdiCodeTags,
  mdiViewSplitVertical,
  mdiTrashCan,
  mdiRestore,
  mdiDotsVertical,
} from '@mdi/js'
import { borderBottom, flexCenter } from '../../lib/styled/styleFunctions'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { ViewModeType } from '../../lib/generalStatus'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import NoteDetailFolderNavigator from './NoteDetailFolderNavigator'
import NoteDetailTagNavigator from './NoteDetailTagNavigator'
import { values } from '../../lib/db/utils'
import { MenuTypes, useContextMenu } from '../../lib/contextMenu'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'

const NoteDetailToolbarContainer = styled.div`
  display: flex;
  height: 40px;
  -webkit-app-region: drag;
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

  const { popup } = useContextMenu()
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()
  const storageId = storage.id
  const storageName = storage.name

  const selectEditMode = useCallback(() => {
    selectViewMode('edit')
  }, [selectViewMode])

  const selectSplitMode = useCallback(() => {
    selectViewMode('split')
  }, [selectViewMode])

  const selectPreviewMode = useCallback(() => {
    selectViewMode('preview')
  }, [selectViewMode])

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'HTML export',
          onClick: async () =>
            await exportNoteAsHtmlFile(note, preferences, previewStyle),
        },
        {
          type: MenuTypes.Normal,
          label: 'Markdown export',
          onClick: async () =>
            await exportNoteAsMarkdownFile(note, {
              includeFrontMatter: preferences['markdown.includeFrontMatter'],
            }),
        },
      ])
    },
    [popup, note, preferences, previewStyle]
  )

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
          onClick={selectEditMode}
          iconPath={mdiCodeTags}
        />
        <ToolbarIconButton
          active={viewMode === 'split'}
          onClick={selectSplitMode}
          iconPath={mdiViewSplitVertical}
        />
        <ToolbarIconButton
          active={viewMode === 'preview'}
          onClick={selectPreviewMode}
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
        <ToolbarIconButton
          onClick={openContextMenu}
          iconPath={mdiDotsVertical}
        />
      </Control>
    </NoteDetailToolbarContainer>
  )
}

export default NoteDetailToolbar

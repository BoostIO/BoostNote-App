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
  mdiStarOutline,
  mdiStar,
} from '@mdi/js'
import { borderBottom, flexCenter } from '../../lib/styled/styleFunctions'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { ViewModeType } from '../../lib/generalStatus'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import NoteDetailNavigator from '../molecules/NotePathnameNavigator'
import NoteDetailTagNavigator from '../molecules/NoteDetailTagNavigator'
import { values } from '../../lib/db/utils'
import { MenuTypes, useContextMenu } from '../../lib/contextMenu'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { useRouteParams } from '../../lib/router'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'

const Container = styled.div`
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

interface NotePageToolbarProps {
  storage: NoteStorage
  note?: NoteDoc
  viewMode: ViewModeType
  selectViewMode: (mode: ViewModeType) => void
}

const NotePageToolbar = ({
  storage,
  note,
  viewMode,
  selectViewMode,
}: NotePageToolbarProps) => {
  const { t } = useTranslation()
  const {
    purgeNote,
    updateNote,
    trashNote,
    untrashNote,
    bookmarkNote,
    unbookmarkNote,
  } = useDb()
  const { report } = useAnalytics()

  const storageId = storage.id
  const storageName = storage.name

  const noteId = note?._id

  const purge = useCallback(async () => {
    if (noteId == null) {
      return
    }
    await purgeNote(storageId, noteId)
  }, [storageId, noteId, purgeNote])

  const trash = useCallback(async () => {
    if (noteId == null) {
      return
    }

    report(analyticsEvents.trashNote)
    await trashNote(storageId, noteId)
  }, [report, storageId, noteId, trashNote])

  const untrash = useCallback(async () => {
    if (noteId == null) {
      return
    }
    await untrashNote(storageId, noteId)
  }, [storageId, noteId, untrashNote])

  const bookmark = useCallback(async () => {
    if (noteId == null) {
      return
    }
    await bookmarkNote(storageId, noteId)
  }, [storageId, noteId, bookmarkNote])

  const unbookmark = useCallback(async () => {
    if (noteId == null) {
      return
    }
    await unbookmarkNote(storageId, noteId)
  }, [storageId, noteId, unbookmarkNote])

  const appendTagByName = useCallback(
    async (tagName: string) => {
      if (note == null) {
        return
      }
      const tagNameSet = new Set(note.tags)
      tagNameSet.add(tagName)
      await updateNote(storage.id, note._id, {
        tags: [...tagNameSet],
      })
    },
    [storage.id, note, updateNote]
  )

  const removeTagByName = useCallback(
    async (tagName: string) => {
      if (note == null) {
        return
      }
      const tagNameSet = new Set(note.tags)
      tagNameSet.delete(tagName)
      await updateNote(storage.id, note._id, {
        tags: [...tagNameSet],
      })
    },
    [storage.id, note, updateNote]
  )

  const storageTags = useMemo(() => {
    if (storage == null) return []
    return values(storage.tagMap).map((tag) => tag.name)
  }, [storage])

  const { popup } = useContextMenu()
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

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
      if (note == null) {
        return
      }
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

  const routeParams = useRouteParams()
  const folderPathname =
    note == null
      ? routeParams.name === 'storages.notes'
        ? routeParams.folderPathname
        : '/'
      : note.folderPathname

  return (
    <Container>
      <NoteDetailNavigator
        storageId={storageId}
        storageName={storageName}
        noteId={note?._id}
        noteFolderPathname={folderPathname}
      />
      <ToolbarSeparator />

      {note != null && (
        <NoteDetailTagNavigator
          storageId={storageId}
          storageTags={storageTags}
          noteId={note._id}
          tags={note.tags}
          appendTagByName={appendTagByName}
          removeTagByName={removeTagByName}
        />
      )}
      {note != null && (
        <Control>
          {preferences['editor.controlMode'] === '3-buttons' ? (
            <>
              <ToolbarIconButton
                active={viewMode === 'edit'}
                title={t('note.edit')}
                onClick={selectEditMode}
                iconPath={mdiCodeTags}
              />
              <ToolbarIconButton
                active={viewMode === 'split'}
                title={t('note.splitView')}
                onClick={selectSplitMode}
                iconPath={mdiViewSplitVertical}
              />
              <ToolbarIconButton
                active={viewMode === 'preview'}
                title={t('note.preview')}
                onClick={selectPreviewMode}
                iconPath={mdiTextSubject}
              />
            </>
          ) : (
            <>
              {viewMode !== 'preview' && (
                <ToolbarIconButton
                  active={viewMode === 'edit'}
                  title='Toggle split'
                  iconPath={mdiViewSplitVertical}
                  onClick={selectSplitMode}
                />
              )}
            </>
          )}
          <ToolbarSeparator />
          <ToolbarIconButton
            active={!!note.data.bookmarked}
            title={t(`bookmark.${!note.data.bookmarked ? 'add' : 'remove'}`)}
            onClick={!note.data.bookmarked ? bookmark : unbookmark}
            iconPath={note.data.bookmarked ? mdiStar : mdiStarOutline}
          />
          {note.trashed ? (
            <>
              <ToolbarIconButton
                title={t('note.restore')}
                onClick={untrash}
                iconPath={mdiRestore}
              />
              <ToolbarIconButton
                title={t('note.delete')}
                onClick={purge}
                iconPath={mdiTrashCan}
              />
            </>
          ) : (
            <ToolbarIconButton
              title={t('note.trash')}
              onClick={trash}
              iconPath={mdiTrashCan}
            />
          )}
          <ToolbarIconButton
            title={t('note.export')}
            onClick={openContextMenu}
            iconPath={mdiDotsVertical}
          />
        </Control>
      )}
    </Container>
  )
}

export default NotePageToolbar

import React, { useMemo, useCallback, MouseEventHandler } from 'react'
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
import { ViewModeType, useGeneralStatus } from '../../lib/generalStatus'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import NotePathnameNavigator from '../molecules/NotePathnameNavigator'
import NoteDetailTagNavigator from '../molecules/NoteDetailTagNavigator'
import { values, isTagNameValid } from '../../lib/db/utils'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile,
  exportNoteAsPdfFile,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { useRouteParams } from '../../lib/routeParams'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { useToast } from '../../lib/toast'
import TopbarSwitchSelector from '../atoms/TopbarSwitchSelector'
import { openContextMenu } from '../../lib/electronOnly'

const Container = styled.div`
  display: flex;
  height: 40px;
  flex-shrink: 0;
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
  const { setPreferences, preferences } = usePreferences()

  const editorControlMode = preferences['editor.controlMode']
  const generalAppMode = preferences['general.appMode']

  const { previewStyle } = usePreviewStyle()
  const { generalStatus } = useGeneralStatus()
  const { noteViewMode, preferredEditingViewMode } = generalStatus
  const { pushMessage } = useToast()

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
      if (note == null || !isTagNameValid(tagName)) {
        return
      }
      const tagNameSet = new Set(note.tags)
      tagNameSet.add(tagName)
      await updateNote(storage.id, note._id, {
        tags: [...tagNameSet].filter((noteTagName) =>
          isTagNameValid(noteTagName)
        ),
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
        tags: [...tagNameSet].filter((noteTagName) =>
          isTagNameValid(noteTagName)
        ),
      })
    },
    [storage.id, note, updateNote]
  )

  const storageTags = useMemo(() => {
    if (storage == null) return []
    return values(storage.tagMap).map((tag) => tag.name)
  }, [storage])

  const selectEditMode = useCallback(() => {
    selectViewMode('edit')
  }, [selectViewMode])

  const selectSplitMode = useCallback(() => {
    selectViewMode('split')
  }, [selectViewMode])

  const selectPreviewMode = useCallback(() => {
    selectViewMode('preview')
  }, [selectViewMode])

  const includeFrontMatter = preferences['markdown.includeFrontMatter']

  const openExportContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (note == null) {
        return
      }
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: 'Markdown export',
            click: async () =>
              await exportNoteAsMarkdownFile(note, {
                includeFrontMatter,
              }),
          },
          {
            type: 'normal',
            label: 'HTML export',
            click: async () =>
              await exportNoteAsHtmlFile(
                note,
                preferences,
                pushMessage,
                previewStyle
              ),
          },
          {
            type: 'normal',
            label: 'PDF export',
            click: async () =>
              await exportNoteAsPdfFile(
                note,
                preferences,
                pushMessage,
                {
                  includeFrontMatter,
                },
                previewStyle
              ),
          },
        ],
      })
    },
    [note, preferences, includeFrontMatter, previewStyle, pushMessage]
  )

  const routeParams = useRouteParams()
  const folderPathname =
    note == null
      ? routeParams.name === 'storages.notes'
        ? routeParams.folderPathname
        : '/'
      : note.folderPathname

  const openTopbarSwitchSelectorContextMenu: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: 'Use 2 toggles layout',
            click: () => {
              setPreferences({
                'editor.controlMode': '2-toggles',
              })
            },
          },
          {
            type: 'normal',
            label: 'Use 3 buttons layout',
            click: () => {
              setPreferences({
                'editor.controlMode': '3-buttons',
              })
            },
          },
        ],
      })
    },
    [setPreferences]
  )

  return (
    <Container>
      <NotePathnameNavigator
        storageId={storageId}
        storageName={storageName}
        noteId={note?._id}
        noteFolderPathname={folderPathname}
      />

      {note != null && (
        <>
          <ToolbarSeparator />
          <NoteDetailTagNavigator
            storageId={storageId}
            storageTags={storageTags}
            noteId={generalAppMode === 'note' ? note._id : undefined}
            tags={note.tags}
            appendTagByName={appendTagByName}
            removeTagByName={removeTagByName}
          />
        </>
      )}
      {note != null && (
        <Control onContextMenu={openTopbarSwitchSelectorContextMenu}>
          {editorControlMode === '3-buttons' ? (
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
                  active={viewMode === 'split'}
                  title='Toggle Split'
                  iconPath={mdiViewSplitVertical}
                  onClick={
                    viewMode === 'edit' ? selectSplitMode : selectEditMode
                  }
                />
              )}
              <TopbarSwitchSelector
                onClick={
                  noteViewMode === 'preview'
                    ? preferredEditingViewMode === 'edit'
                      ? selectEditMode
                      : selectSplitMode
                    : selectPreviewMode
                }
                items={[
                  {
                    active: noteViewMode !== 'preview',
                    label: 'Edit',
                    title: 'Select Edit Mode',
                  },
                  {
                    active: noteViewMode === 'preview',
                    label: 'Preview',
                    title: 'Select Preview Mode',
                  },
                ]}
              />
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
            onClick={openExportContextMenu}
            iconPath={mdiDotsVertical}
          />
        </Control>
      )}
    </Container>
  )
}

export default NotePageToolbar

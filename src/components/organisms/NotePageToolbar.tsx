import React, {
  useMemo,
  useCallback,
  MouseEventHandler,
  useEffect,
} from 'react'
import styled from '../../lib/styled'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import {
  mdiViewSplitVertical,
  mdiTrashCan,
  mdiRestore,
  mdiStarOutline,
  mdiStar,
  mdiExportVariant,
  mdiEye,
  mdiPencil,
} from '@mdi/js'
import { borderBottom, flexCenter } from '../../lib/styled/styleFunctions'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { useGeneralStatus } from '../../lib/generalStatus'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import NotePageToolbarNoteHeader from '../molecules/NotePageToolbarNoteHeader'
import NoteDetailTagNavigator from '../molecules/NoteDetailTagNavigator'
import { isTagNameValid, values } from '../../lib/db/utils'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile,
  exportNoteAsPdfFile,
  convertNoteDocToHtmlString,
  convertNoteDocToMarkdownString,
  convertNoteDocToPdfBuffer,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { useRouteParams } from '../../lib/routeParams'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { useToast } from '../../lib/toast'
import {
  openContextMenu,
  showSaveDialog,
  getPathByName,
  addIpcListener,
  removeIpcListener,
  writeFile,
} from '../../lib/electronOnly'
import NotePageToolbarFolderHeader from '../molecules/NotePageToolbarFolderHeader'
import path from 'path'
import pathParse from 'path-parse'
import { filenamify } from '../../lib/string'

const Container = styled.div`
  display: flex;
  overflow: hidden;
  height: 40px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  padding: 0 8px;
  ${borderBottom};
  align-items: center;
  & > .left {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
`

const Control = styled.div`
  ${flexCenter}
`

interface NotePageToolbarProps {
  storage: NoteStorage
  note?: NoteDoc
}

const NotePageToolbar = ({ storage, note }: NotePageToolbarProps) => {
  const { t } = useTranslation()
  const {
    purgeNote,
    updateNote,
    trashNote,
    untrashNote,
    bookmarkNote,
    unbookmarkNote,
    updateTagByName,
  } = useDb()
  const { report } = useAnalytics()
  const { setPreferences, preferences } = usePreferences()

  const editorControlMode = preferences['editor.controlMode']
  const generalAppMode = preferences['general.appMode']

  const { previewStyle } = usePreviewStyle()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
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
    return [...values(storage.tagMap)]
  }, [storage])

  const updateTagColorByName = useCallback(
    async (tagName: string, color: string) => {
      if (note == null || tagName == null) {
        // Notify user of failed tag color update
        pushMessage({
          title: 'Cannot update tag color.',
          description: 'Invalid note or tag.',
        })
        return
      }
      await updateTagByName(storage.id, tagName, {
        data: { color: color },
      })
    },
    [storage.id, note, updateTagByName, pushMessage]
  )

  const getAttachmentData = useCallback(
    async (src: string) => {
      if (note == null) {
        return
      }
      if (storage.attachmentMap[src] != undefined) {
        return storage.attachmentMap[src]?.getData()
      } else {
        return Promise.reject('Attachment not in map.')
      }
    },
    [note, storage.attachmentMap]
  )

  const selectEditMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'edit',
      preferredEditingViewMode: 'edit',
    })
  }, [setGeneralStatus])

  const selectSplitMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'split',
      preferredEditingViewMode: 'split',
    })
  }, [setGeneralStatus])

  const selectPreviewMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: 'preview',
    })
  }, [setGeneralStatus])

  const togglePreviewMode = useCallback(() => {
    if (noteViewMode === 'preview') {
      if (preferredEditingViewMode === 'edit') {
        selectEditMode()
      } else {
        selectSplitMode()
      }
    } else {
      selectPreviewMode()
    }
  }, [
    noteViewMode,
    preferredEditingViewMode,
    selectEditMode,
    selectSplitMode,
    selectPreviewMode,
  ])

  useEffect(() => {
    addIpcListener('toggle-preview-mode', togglePreviewMode)
    return () => {
      removeIpcListener('toggle-preview-mode', togglePreviewMode)
    }
  }, [togglePreviewMode])

  const toggleSplitEditMode = useCallback(() => {
    if (noteViewMode === 'edit') {
      selectSplitMode()
    } else {
      selectEditMode()
    }
  }, [noteViewMode, selectSplitMode, selectEditMode])

  useEffect(() => {
    addIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
    return () => {
      removeIpcListener('toggle-split-edit-mode', toggleSplitEditMode)
    }
  }, [toggleSplitEditMode])

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
              await exportNoteAsMarkdownFile(note, includeFrontMatter),
          },
          {
            type: 'normal',
            label: 'HTML export',
            click: async () =>
              await exportNoteAsHtmlFile(
                note,
                preferences,
                pushMessage,
                getAttachmentData,
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
                getAttachmentData,
                previewStyle
              ),
          },
        ],
      })
    },
    [
      note,
      preferences,
      includeFrontMatter,
      previewStyle,
      pushMessage,
      getAttachmentData,
    ]
  )

  useEffect(() => {
    const handler = () => {
      if (note == null) {
        return
      }
      showSaveDialog({
        properties: ['createDirectory', 'showOverwriteConfirmation'],
        buttonLabel: 'Save',
        defaultPath: path.join(
          getPathByName('home'),
          filenamify(note.title) + '.md'
        ),
        filters: [
          {
            name: 'Markdown',
            extensions: ['md'],
          },
          {
            name: 'HTML',
            extensions: ['html'],
          },
          {
            name: 'PDF',
            extensions: ['pdf'],
          },
        ],
      }).then(async (result) => {
        if (result.canceled || result.filePath == null) {
          return
        }
        const parsedFilePath = pathParse(result.filePath)
        switch (parsedFilePath.ext) {
          case '.html':
            const htmlString = await convertNoteDocToHtmlString(
              note,
              preferences,
              pushMessage,
              getAttachmentData,
              previewStyle
            )
            await writeFile(result.filePath, htmlString)
            return
          case '.pdf':
            try {
              const pdfBuffer = await convertNoteDocToPdfBuffer(
                note,
                preferences,
                pushMessage,
                getAttachmentData,
                previewStyle
              )

              await writeFile(result.filePath, pdfBuffer)
            } catch (error) {
              console.error(error)
              pushMessage({
                title: 'PDF export failed',
                description: error.message,
              })
            }
            return
          case '.md':
          default:
            const markdownString = convertNoteDocToMarkdownString(
              note,
              includeFrontMatter
            )
            await writeFile(result.filePath, markdownString)
            return
        }
      })
    }
    addIpcListener('save-as', handler)
    return () => {
      removeIpcListener('save-as', handler)
    }
  }, [
    note,
    getAttachmentData,
    includeFrontMatter,
    preferences,
    previewStyle,
    pushMessage,
  ])

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

  const toggleBookmark = useCallback(() => {
    if (note == null) {
      return
    }
    if (note.data.bookmarked) {
      unbookmark()
    } else {
      bookmark()
    }
  }, [note, unbookmark, bookmark])
  useEffect(() => {
    addIpcListener('toggle-bookmark', toggleBookmark)
    return () => {
      removeIpcListener('toggle-bookmark', toggleBookmark)
    }
  })
  return (
    <>
      <Container>
        <div className='left'>
          {note == null ? (
            <NotePageToolbarFolderHeader
              storageId={storageId}
              folderPathname={folderPathname}
            />
          ) : (
            <NotePageToolbarNoteHeader
              storageId={storageId}
              storageName={storageName}
              noteId={note?._id}
              noteTitle={note?.title}
              noteFolderPathname={folderPathname}
            />
          )}
        </div>

        {note != null && (
          <Control onContextMenu={openTopbarSwitchSelectorContextMenu}>
            {editorControlMode === '3-buttons' ? (
              <>
                <ToolbarIconButton
                  active={noteViewMode === 'edit'}
                  title={t('note.edit')}
                  onClick={selectEditMode}
                  iconPath={mdiPencil}
                />
                <ToolbarIconButton
                  active={noteViewMode === 'split'}
                  title={t('note.splitView')}
                  onClick={selectSplitMode}
                  iconPath={mdiViewSplitVertical}
                />
                <ToolbarIconButton
                  active={noteViewMode === 'preview'}
                  title={t('note.preview')}
                  onClick={selectPreviewMode}
                  iconPath={mdiEye}
                />
              </>
            ) : (
              <>
                {noteViewMode !== 'preview' && (
                  <ToolbarIconButton
                    active={noteViewMode === 'split'}
                    title='Toggle Split'
                    iconPath={mdiViewSplitVertical}
                    onClick={toggleSplitEditMode}
                  />
                )}
                {noteViewMode !== 'preview' ? (
                  <ToolbarIconButton
                    iconPath={mdiEye}
                    onClick={selectPreviewMode}
                  />
                ) : (
                  <ToolbarIconButton
                    iconPath={mdiPencil}
                    onClick={selectEditMode}
                  />
                )}
              </>
            )}
            <ToolbarSeparator />
            <ToolbarIconButton
              active={!!note.data.bookmarked}
              title={t(`bookmark.${!note.data.bookmarked ? 'add' : 'remove'}`)}
              onClick={toggleBookmark}
              iconPath={note.data.bookmarked ? mdiStar : mdiStarOutline}
            />
            <ToolbarIconButton
              title={t('note.export')}
              onClick={openExportContextMenu}
              iconPath={mdiExportVariant}
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
          </Control>
        )}
      </Container>
      {note != null && (
        <NoteDetailTagNavigator
          storageId={storageId}
          storageTags={storageTags}
          noteId={generalAppMode === 'note' ? note._id : undefined}
          tags={note.tags}
          appendTagByName={appendTagByName}
          removeTagByName={removeTagByName}
          updateTagColorByName={updateTagColorByName}
        />
      )}
    </>
  )
}

export default NotePageToolbar

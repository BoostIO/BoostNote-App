import React, { useCallback, useMemo } from 'react'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import {
  mdiClockOutline,
  mdiTrashCanOutline,
  mdiLanguageHtml5,
  mdiFileCodeOutline,
  mdiFilePdfOutline,
  mdiLabelMultipleOutline,
  mdiRestore,
  mdiPlusBoxMultipleOutline,
  mdiLinkPlus,
  mdiAccountMultiple,
  mdiHistory,
  mdiArchive,
} from '@mdi/js'
import { isTagNameValid } from '../../lib/db/utils'
import NoteDetailTagNavigator from '../molecules/NoteDetailTagNavigator'
import { useDb } from '../../lib/db'
import { getFormattedDateTime } from '../../lib/time'
import { useTranslation } from 'react-i18next'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import {
  exportNoteAsMarkdownFile,
  exportNoteAsHtmlFile,
  exportNoteAsPdfFile,
  openDialog,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import styled from '../../shared/lib/styled'
import Icon from '../../shared/components/atoms/Icon'
import { useToast } from '../../shared/lib/stores/toast'
import { getPathByName, openPath, showSaveDialog } from '../../lib/electronOnly'
import path, { join } from 'path'
import { filenamify } from '../../lib/string'

interface NoteContextViewProps {
  storage: NoteStorage
  note: NoteDoc
}

const NoteContextView = ({ storage, note }: NoteContextViewProps) => {
  const {
    updateNote,
    updateTagByName,
    purgeNote,
    trashNote,
    untrashNote,
  } = useDb()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const { report } = useAnalytics()
  const storageId = storage.id
  const noteId = note._id
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

  const includeFrontMatter = preferences['markdown.includeFrontMatter']
  const { toggleShowingCloudIntroModal } = useCloudIntroModal()

  const appendTagByName = useCallback(
    async (tagName: string) => {
      if (note == null || !isTagNameValid(tagName)) {
        return
      }
      const tagNameSet = new Set(note.tags)
      tagNameSet.add(tagName)
      await updateNote(storageId, note._id, {
        tags: [...tagNameSet].filter((noteTagName) =>
          isTagNameValid(noteTagName)
        ),
      })
    },
    [storageId, note, updateNote]
  )

  const removeTagByName = useCallback(
    async (tagName: string) => {
      if (note == null) {
        return
      }
      const tagNameSet = new Set(note.tags)
      tagNameSet.delete(tagName)
      await updateNote(storageId, note._id, {
        tags: [...tagNameSet].filter((noteTagName) =>
          isTagNameValid(noteTagName)
        ),
      })
    },
    [storageId, note, updateNote]
  )

  const updateTagColorByName = useCallback(
    async (tagName: string, color: string) => {
      if (note == null || tagName == null) {
        pushMessage({
          title: 'Cannot update tag color.',
          description: 'Invalid note or tag.',
        })
        return
      }
      await updateTagByName(storageId, tagName, {
        data: { color: color },
      })
    },
    [note, updateTagByName, storageId, pushMessage]
  )

  const updatedAt = useMemo(() => {
    return getFormattedDateTime(note.updatedAt, 'at')
  }, [note.updatedAt])
  const createdAt = useMemo(() => {
    return getFormattedDateTime(note.createdAt, 'at')
  }, [note.createdAt])

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

  const exportAsMarkdown = useCallback(async () => {
    const savePathname = await openDialog()
    if (!savePathname) {
      return
    }
    await exportNoteAsMarkdownFile(
      savePathname,
      note.title,
      note,
      storage.attachmentMap,
      includeFrontMatter
    )
    pushMessage({
      onClick: () => {
        const exportedNoteName = `${filenamify(note.title)}`
        const exportedNoteFilename = `${exportedNoteName}.md`
        openPath(join(savePathname, exportedNoteFilename))
      },
      type: 'success',
      title: 'Markdown export',
      description: 'Markdown file exported successfully.',
    })
  }, [note, storage.attachmentMap, includeFrontMatter, pushMessage])

  const exportAsHtml = useCallback(async () => {
    const savePathname = await openDialog()
    if (!savePathname) {
      return
    }
    await exportNoteAsHtmlFile(
      savePathname,
      note.title,
      note,
      preferences['markdown.codeBlockTheme'],
      preferences['general.theme'],
      pushMessage,
      storage.attachmentMap,
      previewStyle
    )
    pushMessage({
      onClick: () => {
        const exportedNoteName = `${filenamify(note.title)}`
        const exportedNoteFilename = `${exportedNoteName}.html`
        openPath(join(savePathname, exportedNoteFilename))
      },
      type: 'success',
      title: 'HTML export',
      description: 'HTML file exported successfully.',
    })
  }, [note, preferences, pushMessage, storage.attachmentMap, previewStyle])

  const exportAsPdf = useCallback(async () => {
    showSaveDialog({
      properties: ['createDirectory', 'showOverwriteConfirmation'],
      buttonLabel: 'Save',
      defaultPath: path.join(
        getPathByName('home'),
        filenamify(note.title) + '.pdf'
      ),
      filters: [
        {
          name: 'PDF',
          extensions: ['pdf'],
        },
      ],
    }).then(async (result) => {
      if (result.canceled || result.filePath == null) {
        return
      }
      await exportNoteAsPdfFile(
        result.filePath,
        note,
        preferences['markdown.codeBlockTheme'],
        preferences['general.theme'],
        pushMessage,
        storage.attachmentMap,
        preferences['export.printOptions'],
        previewStyle
      )
    })
  }, [note, preferences, pushMessage, storage.attachmentMap, previewStyle])

  return (
    <Container>
      <ControlItem>
        <ControlItemLabel>
          <LabelIcon path={mdiClockOutline} />
          Created
        </ControlItemLabel>
        <ControlItemContent>
          <NoWrap>{createdAt}</NoWrap>
        </ControlItemContent>
      </ControlItem>
      <ControlItem>
        <ControlItemLabel>
          <LabelIcon path={mdiClockOutline} />
          Last updated
        </ControlItemLabel>
        <ControlItemContent>
          <NoWrap>{updatedAt}</NoWrap>
        </ControlItemContent>
      </ControlItem>

      <Separator />

      <ControlItem>
        <ControlItemLabel>
          <LabelIcon path={mdiLabelMultipleOutline} />
          Labels
        </ControlItemLabel>
        <ControlItemContent>
          <NoteDetailTagNavigator
            storage={storage}
            noteId={note._id}
            tags={note.tags}
            appendTagByName={appendTagByName}
            removeTagByName={removeTagByName}
            updateTagColorByName={updateTagColorByName}
          />
        </ControlItemContent>
      </ControlItem>

      <Separator />

      <ControlItem>
        <CloudIntroItemLabel>
          <LabelIcon path={mdiAccountMultiple} />
          Guests
        </CloudIntroItemLabel>
        <CloudIntroItemContent>
          <TryCloudButton onClick={toggleShowingCloudIntroModal}>
            Try Cloud
          </TryCloudButton>
        </CloudIntroItemContent>
      </ControlItem>
      <ControlItem>
        <CloudIntroItemLabel>
          <LabelIcon path={mdiLinkPlus} />
          Public Sharing
        </CloudIntroItemLabel>
        <CloudIntroItemContent>
          <TryCloudButton onClick={toggleShowingCloudIntroModal}>
            Try Cloud
          </TryCloudButton>
        </CloudIntroItemContent>
      </ControlItem>

      <Separator />

      <ControlItem>
        <CloudIntroItemLabel>
          <LabelIcon path={mdiHistory} />
          Revisions
        </CloudIntroItemLabel>
        <CloudIntroItemContent>
          <TryCloudButton onClick={toggleShowingCloudIntroModal}>
            Try Cloud
          </TryCloudButton>
        </CloudIntroItemContent>
      </ControlItem>

      <Separator />

      <ControlItem>
        <CloudIntroItemLabel>
          <LabelIcon path={mdiPlusBoxMultipleOutline} />
          Save As Template
        </CloudIntroItemLabel>
        <CloudIntroItemContent>
          <TryCloudButton onClick={toggleShowingCloudIntroModal}>
            Try Cloud
          </TryCloudButton>
        </CloudIntroItemContent>
      </ControlItem>
      {note.trashed ? (
        <>
          <ButtonItem title={t('note.restore')} onClick={untrash}>
            <LabelIcon path={mdiRestore} />
            <ButtonLabel>{t('note.restore')}</ButtonLabel>
          </ButtonItem>
          <ButtonItem title={t('note.delete')} onClick={purge}>
            <LabelIcon path={mdiTrashCanOutline} />
            <ButtonLabel>{t('note.delete')}</ButtonLabel>
          </ButtonItem>
        </>
      ) : (
        <ButtonItem title={t('note.archive')} onClick={trash}>
          <LabelIcon path={mdiArchive} />
          <ButtonLabel>Archive</ButtonLabel>
        </ButtonItem>
      )}

      <Separator />

      <ButtonItem onClick={exportAsMarkdown}>
        <LabelIcon path={mdiFileCodeOutline} />
        <ButtonLabel>Markdown Export</ButtonLabel>
      </ButtonItem>
      <ButtonItem onClick={exportAsHtml}>
        <LabelIcon path={mdiLanguageHtml5} />
        <ButtonLabel>HTML Export</ButtonLabel>
      </ButtonItem>
      <ButtonItem onClick={exportAsPdf}>
        <LabelIcon path={mdiFilePdfOutline} />
        <ButtonLabel>PDF Export</ButtonLabel>
      </ButtonItem>
    </Container>
  )
}

export default NoteContextView

const Container = styled.div`
  padding: 4px 0;
  width: 350px;
  border-left: 1px solid ${({ theme }) => theme.colors.border.second};
  border-radius: 0;
  height: 100vh;
`

const Separator = styled.div`
  height: 1px;
  margin: 8px 16px;
  background-color: ${({ theme }) => theme.colors.border.main};
  flex-shrink: 0;
`

const ControlItem = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`

const ControlItemLabelIconContainer = styled.div`
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface LabelIconProps {
  path: string
}

const LabelIcon = ({ path }: LabelIconProps) => {
  return (
    <ControlItemLabelIconContainer>
      <Icon size={16} path={path} />
    </ControlItemLabelIconContainer>
  )
}

const ControlItemLabel = styled.div`
  height: 30px;
  width: 120px;
  margin-right: 30px;
  display: flex;
  align-items: center;
  margin-left: 10px;
  flex-shrink: 0;
`

const NoWrap = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ControlItemContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-right: 10px;
`

const CloudIntroItemLabel = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  margin-left: 10px;
  flex-shrink: 0;
  flex-grow: 1;
`
const CloudIntroItemContent = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-right: 10px;
`

const TryCloudButton = styled.button`
  background-color: ${({ theme }) => theme.colors.variants.primary.base};
  color: ${({ theme }) => theme.colors.variants.primary.text};
  font-size: 12px;
  border: none;

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
  }
  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background.tertiary};
  }
  &:disabled,
  &.disabled {
    opacity: 0.5;
    cursor: default;
  }
  padding: 5px 10px;
  border-radius: 4px;
`

const ButtonItem = styled.button`
  height: 40px;
  width: 100%;
  text-align: left;
  border: none;
  padding: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
  &:hover:active,
  &:hover.active {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`

const ButtonLabel = styled.div``

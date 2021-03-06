import React, { useCallback, useMemo } from 'react'
import styled from '../../lib/styled'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import Icon from '../atoms/Icon'
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
} from '@mdi/js'
import { isTagNameValid } from '../../lib/db/utils'
import NoteDetailTagNavigator from '../molecules/NoteDetailTagNavigator'
import { useDb } from '../../lib/db'
import { useToast } from '../../lib/toast'
import { getFormattedDateTime } from '../../lib/time'
import { useTranslation } from 'react-i18next'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import {
  exportNoteAsMarkdownFile,
  exportNoteAsHtmlFile,
  exportNoteAsPdfFile,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'

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
        // Notify user of failed tag color update
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
    [storageId, note, updateTagByName, pushMessage]
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

  const exportAsMarkdown = useCallback(async () => {
    await exportNoteAsMarkdownFile(note, includeFrontMatter)
  }, [note, includeFrontMatter])

  const exportAsHtml = useCallback(async () => {
    await exportNoteAsHtmlFile(
      note,
      preferences,
      pushMessage,
      getAttachmentData,
      previewStyle
    )
  }, [note, preferences, pushMessage, getAttachmentData, previewStyle])

  const exportAsPdf = useCallback(async () => {
    await exportNoteAsPdfFile(
      note,
      preferences,
      pushMessage,
      getAttachmentData,
      previewStyle
    )
  }, [note, preferences, pushMessage, getAttachmentData, previewStyle])

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
          <ButtonItem title={t('note.trash')} onClick={purge}>
            <LabelIcon path={mdiTrashCanOutline} />
            <ButtonLabel>{t('note.delete')}</ButtonLabel>
          </ButtonItem>
        </>
      ) : (
        <ButtonItem title={t('note.delete')} onClick={trash}>
          <LabelIcon path={mdiTrashCanOutline} />
          <ButtonLabel>Trash</ButtonLabel>
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  width: 350px;
  overflow-y: auto;
  border-left: solid 1px ${({ theme }) => theme.borderColor};
  flex-shrink: 0;
  color: ${({ theme }) => theme.uiTextColor};
`

const Separator = styled.div`
  height: 1px;
  margin: 8px 16px;
  background-color: ${({ theme }) => theme.borderColor};
  flex-shrink: 0;
`

const ControlItem = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 30px;
  color: ${({ theme }) => theme.navItemColor};
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
      <Icon size={18} path={path} />
    </ControlItemLabelIconContainer>
  )
}

const ControlItemLabel = styled.div`
  height: 40px;
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
  background-color: ${({ theme }) => theme.primaryColor};
  color: ${({ theme }) => theme.primaryButtonLabelColor};
  font-size: 12px;
  border: none;

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
  }
  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor};
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
  color: ${({ theme }) => theme.navItemColor};
  font-size: 14px;
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};
  }
  &:hover:active,
  &:hover.active {
    background-color: ${({ theme }) => theme.navItemHoverActiveBackgroundColor};
  }
`

const ButtonLabel = styled.div``

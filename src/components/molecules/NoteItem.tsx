import React, { useMemo, useCallback } from 'react'
import styled from '../../lib/styled/styled'
import {
  borderBottom,
  uiTextColor,
  secondaryBackgroundColor,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import cc from 'classcat'
import { setTransferrableNoteData } from '../../lib/dnd'
import HighlightText from '../atoms/HighlightText'
import { formatDistanceToNow } from 'date-fns'
import { scaleAndTransformFromLeft } from '../../lib/styled'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useTranslation } from 'react-i18next'
import { NoteDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { GeneralNoteListViewOptions } from '../../lib/preferences'

const Container = styled.button`
  margin: 0;
  border-left: 2px solid transparent;
  cursor: pointer;
  width: 100%;
  background-color: transparent;
  text-align: left;
  padding: 8px 10px 8px 8px;
  ${uiTextColor}

  border-color: transparent;
  border-style: solid;
  border-width: 0 0 0 2px;

  &.active,
  &:active,
  &:focus,
  &:hover {
    ${secondaryBackgroundColor}
  }
  &.active {
    border-left-color: ${({ theme }) => theme.primaryColor};
  }
  ${borderBottom}
  transition: 200ms background-color;

  &.new {
    position: relative;
    left: -200px;
    transform: scaleY(0.3);
    transform-origin: top left;
    animation: ${scaleAndTransformFromLeft} 0.2s linear forwards;
  }
`

const TitleSection = styled.div`
  font-size: 17px;
  font-weight: bold;
  width: 100%;
  ${textOverflow}
`

const DateSection = styled.div`
  font-size: 10px;
  margin-top: 5px;
  font-style: italic;
  ${textOverflow}
`

const PreviewSection = styled.div`
  margin-top: 6px;
  ${textOverflow}
`

const TagListSection = styled.div`
  margin-top: 6px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
`

const TagListItem = styled.div`
  height: 20px;
  padding: 0 8px;
  margin-right: 2px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.textColor};
  font-size: 12px;
  line-height: 20px;
  ${textOverflow}
`

type NoteItemProps = {
  storageId: string
  note: NoteDoc
  active: boolean
  recentlyCreated?: boolean
  search: string
  basePathname: string
  focusList: () => void
  noteListView: GeneralNoteListViewOptions
  applyDefaultNoteListing: () => void
  applyCompactListing: () => void
}

const NoteItem = ({
  storageId,
  note,
  active,
  basePathname,
  search,
  recentlyCreated,
  noteListView,
  applyDefaultNoteListing,
  applyCompactListing,
}: NoteItemProps) => {
  const href = `${basePathname}/${note._id}`
  const { popup } = useContextMenu()
  const { createNote, trashNote, purgeNote, untrashNote } = useDb()
  const { push } = useRouter()

  const { messageBox } = useDialog()
  const { t } = useTranslation()

  const openUntrashedNoteContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()

      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'Duplicate Note',
          onClick: async () => {
            createNote(storageId, {
              title: note.title,
              content: note.content,
              folderPathname: note.folderPathname,
              tags: note.tags,
              data: note.data,
            })
          },
        },
        { type: MenuTypes.Separator },
        {
          type: MenuTypes.Normal,
          label: 'Trash Note',
          onClick: async () => {
            if (note.trashed) {
              return
            }
            trashNote(storageId, note._id)
          },
        },
        { type: MenuTypes.Separator },
        {
          type: MenuTypes.Normal,
          label: 'Default View',
          onClick: applyDefaultNoteListing,
        },
        {
          type: MenuTypes.Normal,
          label: 'Compact View',
          onClick: applyCompactListing,
        },
      ])
    },
    [
      popup,
      createNote,
      storageId,
      note.title,
      note.content,
      note.folderPathname,
      note.tags,
      note.data,
      note.trashed,
      note._id,
      trashNote,
      applyDefaultNoteListing,
      applyCompactListing,
    ]
  )

  const openTrashedNoteContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()

      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'Restore Note',
          onClick: async () => {
            untrashNote(storageId, note._id)
          },
        },
        { type: MenuTypes.Separator },
        {
          type: MenuTypes.Normal,
          label: 'Delete Note',
          onClick: async () => {
            messageBox({
              title: 'Delete Note',
              message: t('note.deleteMessage'),
              iconType: DialogIconTypes.Warning,
              buttons: [t('note.delete2'), t('general.cancel')],
              defaultButtonIndex: 0,
              cancelButtonIndex: 1,
              onClose: (value: number | null) => {
                if (value === 0) {
                  purgeNote(storageId, note._id)
                }
              },
            })
          },
        },
        { type: MenuTypes.Separator },
        {
          type: MenuTypes.Normal,
          label: 'Default View',
          onClick: applyDefaultNoteListing,
        },
        {
          type: MenuTypes.Normal,
          label: 'Compact View',
          onClick: applyCompactListing,
        },
      ])
    },
    [
      storageId,
      note._id,
      t,
      popup,
      untrashNote,
      purgeNote,
      messageBox,
      applyDefaultNoteListing,
      applyCompactListing,
    ]
  )

  const contentPreview = useMemo(() => {
    const trimmedContent = note.content.trim()
    const searchFirstIndex = trimmedContent
      .toLowerCase()
      .indexOf(search.toLowerCase())

    if (search !== '' && searchFirstIndex !== -1) {
      const contentToHighlight = trimmedContent
        .substring(searchFirstIndex)
        .split('\n')
        .shift()

      return contentToHighlight == null ? (
        t('note.empty')
      ) : (
        <HighlightText text={contentToHighlight} search={search} />
      )
    }

    return trimmedContent.split('\n').shift() || t('note.empty')
  }, [note.content, search, t])

  const loadTransferrableNoteData = useCallback(
    (event: React.DragEvent) => {
      setTransferrableNoteData(event, storageId, note)
    },
    [storageId, note]
  )

  const navigateToNote = useCallback(() => {
    push(href)
  }, [push, href])

  return (
    <Container
      onContextMenu={
        note.trashed ? openTrashedNoteContextMenu : openUntrashedNoteContextMenu
      }
      className={cc([active && 'active', recentlyCreated && 'new'])}
      onDragStart={loadTransferrableNoteData}
      draggable={true}
      onClick={navigateToNote}
    >
      <TitleSection>
        {note.title.length === 0 ? (
          t('note.noTitle')
        ) : (
          <HighlightText text={note.title} search={search} />
        )}
      </TitleSection>
      {noteListView !== 'compact' && (
        <>
          <DateSection>
            {formatDistanceToNow(new Date(note.updatedAt))} {t('note.date')}
          </DateSection>
          <PreviewSection>{contentPreview}</PreviewSection>
          {note.tags.length > 0 && (
            <TagListSection>
              {note.tags.map((tag) => (
                <TagListItem key={tag}>
                  <HighlightText text={tag} search={search} />
                </TagListItem>
              ))}
            </TagListSection>
          )}
        </>
      )}
    </Container>
  )
}

export default NoteItem

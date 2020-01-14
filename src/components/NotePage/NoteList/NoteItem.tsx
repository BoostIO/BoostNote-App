import React, { useMemo, useCallback } from 'react'
import { Link } from '../../../lib/router'
import styled from '../../../lib/styled/styled'
import {
  borderBottom,
  uiTextColor,
  secondaryBackgroundColor,
  inputStyle
} from '../../../lib/styled/styleFunctions'
import cc from 'classcat'
import { setTransferrableNoteData } from '../../../lib/dnd'
import HighlightText from '../../atoms/HighlightText'
import { formatDistanceToNow } from 'date-fns'
import { scaleAndTransformFromLeft } from '../../../lib/styled'
import { PopulatedNoteDoc } from '../../../lib/db/types'
import { useContextMenu, MenuTypes, MenuItem } from '../../../lib/contextMenu'
import { useDb } from '../../../lib/db'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useTranslation } from 'react-i18next'

export const StyledNoteListItem = styled.div`
  margin: 0;
  border-left: 2px solid transparent;
  ${uiTextColor}
  &.active,
  &:active,
  &:focus,
  &:hover {
    ${secondaryBackgroundColor}
  }
  &.active {
    border-left: 2px solid ${({ theme }) => theme.primaryColor};
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

  a {
    text-decoration: none;
  }

  .container {
    padding: 10px 12px;
  }

  .title {
    font-size: 18px;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .date {
    font-size: 10px;
    font-style: italic;
    margin-bottom: 6px;
  }

  .preview {
    font-size: 13px;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .tag-area,
  .title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag {
    font-size: 12px;
    ${inputStyle}
    margin-right: 5px;
    padding: 2px 8px;
    border-radius: 13px;
    display: inline-block;
  }
`

type NoteItemProps = {
  note: PopulatedNoteDoc
  active: boolean
  recentlyCreated?: boolean
  search: string
  basePathname: string
  focusList: () => void
}

export default ({
  note,
  active,
  basePathname,
  search,
  recentlyCreated
}: NoteItemProps) => {
  const href = `${basePathname}/${note._id}`
  const { popup } = useContextMenu()
  const { createNote, trashNote, updateNote, purgeNote, untrashNote } = useDb()

  const { messageBox } = useDialog()
  const { t } = useTranslation()

  const contextMenuCallback = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()

      const menuItems: MenuItem[] = note.trashed
        ? [
            {
              type: MenuTypes.Normal,
              label: t('note.restore'),
              onClick: async () => {
                untrashNote(note.storageId, note._id)
              }
            },
            {
              type: MenuTypes.Normal,
              label: t('note.delete'),
              onClick: async () => {
                if (!note.trashed) {
                  trashNote(note.storageId, note._id)
                } else {
                  messageBox({
                    title: t('note.delete2'),
                    message: t('note.deleteMessage'),
                    iconType: DialogIconTypes.Warning,
                    buttons: [t('note.delete2'), t('general.cancel')],
                    defaultButtonIndex: 0,
                    cancelButtonIndex: 1,
                    onClose: (value: number | null) => {
                      if (value === 0) {
                        purgeNote(note.storageId, note._id)
                      }
                    }
                  })
                }
              }
            }
          ]
        : [
            {
              type: MenuTypes.Normal,
              label: t('note.duplicate'),
              onClick: async () => {
                createNote(note.storageId, {
                  title: note.title,
                  content: note.content,
                  folderPathname: note.folderPathname,
                  tags: note.tags,
                  bookmarked: false,
                  data: note.data
                })
              }
            },
            {
              type: MenuTypes.Normal,
              label: t('note.delete'),
              onClick: async () => {
                if (!note.trashed) {
                  trashNote(note.storageId, note._id)
                } else {
                  messageBox({
                    title: t('note.delete2'),
                    message: t('note.deleteMessage'),
                    iconType: DialogIconTypes.Warning,
                    buttons: [t('note.delete2'), t('general.cancel')],
                    defaultButtonIndex: 0,
                    cancelButtonIndex: 1,
                    onClose: (value: number | null) => {
                      if (value === 0) {
                        purgeNote(note.storageId, note._id)
                      }
                    }
                  })
                }
              }
            },
            {
              type: MenuTypes.Normal,
              label: note.bookmarked ? t('bookmark.remove') : t('bookmark.add'),
              onClick: async () => {
                note.bookmarked = !note.bookmarked
                updateNote(note.storageId, note._id, note)
              }
            }
          ]

      popup(event, menuItems)
    },
    [
      popup,
      createNote,
      note,
      updateNote,
      trashNote,
      messageBox,
      purgeNote,
      t,
      untrashNote
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

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      setTransferrableNoteData(event, note.storageId, note)
    },
    [note]
  )

  return (
    <StyledNoteListItem
      onContextMenu={contextMenuCallback}
      className={cc([active && 'active', recentlyCreated && 'new'])}
      onDragStart={handleDragStart}
      draggable={true}
    >
      <Link href={href}>
        <div className='container'>
          <div className='title'>
            <HighlightText text={note.title} search={search} />
          </div>
          {note.title.length === 0 && (
            <div className='title'>{t('note.noTitle')}</div>
          )}
          <div className='date'>
            {formatDistanceToNow(new Date(note.updatedAt))} {t('note.date')}
          </div>
          <div className='preview'>{contentPreview}</div>
          {note.tags.length > 0 && (
            <div className='tag-area'>
              {note.tags.map(tag => (
                <span className='tag' key={tag}>
                  <HighlightText text={tag} search={search} />
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </StyledNoteListItem>
  )
}

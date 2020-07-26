import React, { useMemo, useCallback, useRef, useState } from 'react'
import styled from '../../../lib/styled/styled'
import {
  uiTextColor,
  inputStyle,
  backgroundColor,
} from '../../../lib/styled/styleFunctions'
import HighlightText from '../../../components/atoms/HighlightText'
import { formatDistanceToNow } from 'date-fns'
import { scaleAndTransformFromLeft } from '../../../lib/styled'
import { useContextMenu, MenuTypes, MenuItem } from '../../../lib/contextMenu'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useTranslation } from 'react-i18next'
import { useRouter } from '../../lib/router'
import { NoteDoc } from '../../../lib/db/types'
import { mdiTrashCan } from '@mdi/js'
import Icon from '../../../components/atoms/Icon'

export const NoteListItemContainer = styled.div`
  margin: 0;
  overflow: hidden;
  position: relative;
  ${uiTextColor}
  border-bottom: solid 1px #17191B;
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
    background-color: #1e2022;
    &.active {
      border-left: 2px solid ${({ theme }) => theme.primaryColor};
    }
    padding: 10px 12px;
    position: relative;
    width: 100%;
    left: 0;
    transition: left 150ms ease-in-out;
  }

  &.swiped .container {
    left: -68px;
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

const NoteItemControlContainer = styled.div`
  width: 68px;
  position: absolute;
  height: 100%;
  right: -68px;
  top: 0;
  transition: right 150ms ease-in-out;

  &.swiped {
    right: 0;
  }

  button {
    width: 68px;
    ${backgroundColor}
    height: 100%;
    border-width: 0 1px 0 0;
    border-style: solid;
    border-color: #17191b;
    color: #acadad;
    &:last-child {
      border-width: 0;
    }
  }
`

type NoteItemProps = {
  note: NoteDoc
  storageId: string
  recentlyCreated?: boolean
  search?: string
  basePathname: string
  focusList: () => void
}

export default ({
  note,
  storageId,
  basePathname,
  search = '',
}: NoteItemProps) => {
  const href = `${basePathname}/${note._id}`
  const { popup } = useContextMenu()
  const { push } = useRouter()
  const { createNote, trashNote, purgeNote, untrashNote } = useDb()

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
                untrashNote(storageId, note._id)
              },
            },
            {
              type: MenuTypes.Normal,
              label: t('note.delete'),
              onClick: async () => {
                if (!note.trashed) {
                  trashNote(storageId, note._id)
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
                        purgeNote(storageId, note._id)
                      }
                    },
                  })
                }
              },
            },
          ]
        : [
            {
              type: MenuTypes.Normal,
              label: t('note.duplicate'),
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
            {
              type: MenuTypes.Normal,
              label: t('note.delete'),
              onClick: async () => {
                if (!note.trashed) {
                  trashNote(storageId, note._id)
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
                        purgeNote(storageId, note._id)
                      }
                    },
                  })
                }
              },
            },
          ]

      popup(event, menuItems)
    },
    [
      popup,
      createNote,
      note,
      storageId,
      trashNote,
      messageBox,
      purgeNote,
      t,
      untrashNote,
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

  const touchStartClientXRef = useRef({
    startClientX: -1,
    currentClientX: -1,
  })

  const [swiped, setSwiped] = useState(false)

  return (
    <NoteListItemContainer
      onContextMenu={contextMenuCallback}
      className={swiped ? 'swiped' : ''}
      onTouchStart={(event: React.TouchEvent) => {
        touchStartClientXRef.current.startClientX =
          event.targetTouches[0].clientX
        touchStartClientXRef.current.currentClientX =
          event.targetTouches[0].clientX
      }}
      onTouchMove={(event: React.TouchEvent) => {
        touchStartClientXRef.current.currentClientX =
          event.targetTouches[0].clientX
      }}
      onTouchEnd={() => {
        const diff =
          touchStartClientXRef.current.startClientX -
          touchStartClientXRef.current.currentClientX
        const direction = diff > 10 ? 'left' : diff < -10 ? 'right' : 'idle'
        if (swiped && direction === 'right') {
          setSwiped(false)
        }
        if (!swiped && direction === 'left') {
          setSwiped(true)
        }
      }}
    >
      <div
        className='container'
        onClick={() => {
          push(href)
          if (swiped) {
            setSwiped(false)
          }
        }}
      >
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
            {note.tags.map((tag) => (
              <span className='tag' key={tag}>
                <HighlightText text={tag} search={search} />
              </span>
            ))}
          </div>
        )}
      </div>
      <NoteItemControlContainer className={swiped ? 'swiped' : ''}>
        {/* <button
          onClick={() => {
            updateNote(note.storageId, note._id, {
              bookmarked: !note.bookmarked
            })
            if (swiped) {
              setSwiped(false)
            }
          }}
        >
          {note.bookmarked ? <IconStarActive /> : <IconStar />}
        </button> */}
        <button
          onClick={() => {
            if (!note.trashed) {
              trashNote(storageId, note._id)
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
                    purgeNote(storageId, note._id)
                  }
                },
              })
            }
          }}
        >
          <Icon path={mdiTrashCan} />
        </button>
      </NoteItemControlContainer>
    </NoteListItemContainer>
  )
}

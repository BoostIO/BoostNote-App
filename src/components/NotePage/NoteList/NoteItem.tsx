import React, { useMemo, useCallback } from 'react'
import { Link } from '../../../lib/router'
import styled from '../../../lib/styled/styled'
import { NoteDoc } from '../../../lib/db/types'
import {
  borderBottom,
  uiTextColor,
  secondaryBackgroundColor
} from '../../../lib/styled/styleFunctions'
import cc from 'classcat'
import { setTransferrableNoteData } from '../../../lib/dnd'

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
    font-size: 12px;
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

  .tag-area {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag {
    font-size: 12px;
    background-color: rgba(153, 153, 153, 0.4);
    margin-right: 5px;
    padding: 2px 8px;
    border-radius: 13px;
    display: inline-block;
  }

  .highlighted {
    background: rgba(3, 197, 136, 0.6);
  }
`

type NoteItemProps = {
  note: NoteDoc
  active: boolean
  storageId: string
  search: string
  basePathname: string
  focusList: () => void
}

export default ({
  storageId,
  note,
  active,
  basePathname,
  search
}: NoteItemProps) => {
  const href = `${basePathname}/${note._id}`

  const getHighlightedText = useCallback(
    (text: string) => {
      if (search === '') return text
      const searchRegex = new RegExp(`(${search})`, 'gi')
      const parts = text.split(searchRegex)
      return (
        <span>
          {parts.map((part, i) =>
            part.toLowerCase() === search.toLowerCase() ? (
              <span key={i} className='highlighted'>
                {part}
              </span>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            )
          )}
        </span>
      )
    },
    [search]
  )

  const contentPreview = useMemo(() => {
    const trimmedContent = note.content.trim()
    const searchFirstIndex = trimmedContent
      .toLowerCase()
      .indexOf(search.toLowerCase())
    if (search !== '' && searchFirstIndex !== -1) {
      return getHighlightedText(
        trimmedContent
          .substring(searchFirstIndex)
          .split('\n')
          .shift() || 'Empty note'
      )
    }

    return trimmedContent.split('\n').shift() || 'Empty note'
  }, [note.content, search])

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      setTransferrableNoteData(event, storageId, note)
    },
    [note, storageId]
  )

  return (
    <StyledNoteListItem
      className={cc([active && 'active'])}
      onDragStart={handleDragStart}
      draggable={true}
    >
      <Link href={href}>
        <div className='container'>
          <div className='title'>{getHighlightedText(note.title)}</div>
          {note.title.length === 0 && <div className='title'>No title</div>}
          <div className='date'>DD days ago</div>
          <div className='preview'>{contentPreview}</div>
          {note.tags.length > 0 && (
            <div className='tag-area'>
              {note.tags.map(tag => (
                <span key={tag}>{getHighlightedText(tag)}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </StyledNoteListItem>
  )
}

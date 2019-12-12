import React, { useMemo, useCallback } from 'react'
import { Link } from '../../../lib/router'
import styled from '../../../lib/styled/styled'
import { NoteDoc } from '../../../lib/db/types'
import Icon from '../../atoms/Icon'
import { mdiTagOutline } from '@mdi/js'
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
    padding: 8px;
  }

  .title {
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 4px;
  }

  .preview {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .highlighted {
    background: rgba(217, 211, 46, 0.6);
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
    const searchFirstIndex = note.content
      .trim()
      .toLowerCase()
      .indexOf(search.toLowerCase())
    if (search !== '' && searchFirstIndex !== -1) {
      return getHighlightedText(
        note.content
          .trim()
          .substring(searchFirstIndex)
          .split('\n')
          .shift() || 'Empty note'
      )
    }

    return (
      note.content
        .trim()
        .split('\n')
        .shift() || 'Empty note'
    )
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
          <div className='preview'>{contentPreview}</div>
          {note.tags.length > 0 && (
            <div>
              <Icon path={mdiTagOutline} />{' '}
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

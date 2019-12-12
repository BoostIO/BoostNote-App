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
import GetHighlightedText from '../../../lib/highlight'

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

  const noteTitle = useMemo(() => {
    return <GetHighlightedText text={note.title} search={search} />
  }, [search, note.title])

  const noteTags = useMemo(() => {
    return note.tags.map(tag => (
      <GetHighlightedText key={tag} text={tag} search={search} />
    ))
  }, [note.tags, search])

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
        'Empty note'
      ) : (
        <GetHighlightedText text={contentToHighlight} search={search} />
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
          <div className='title'>{noteTitle}</div>
          {note.title.length === 0 && <div className='title'>No title</div>}
          <div className='date'>DD days ago</div>
          <div className='preview'>{contentPreview}</div>
          {note.tags.length > 0 && <div className='tag-area'>{noteTags}</div>}
        </div>
      </Link>
    </StyledNoteListItem>
  )
}

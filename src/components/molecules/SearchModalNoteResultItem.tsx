import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { NoteDoc } from '../../lib/db/types'
import Icon from '../atoms/Icon'
import { mdiTextBoxOutline, mdiTagMultiple, mdiFolder } from '@mdi/js'
import {
  flexCenter,
  borderBottom,
  textOverflow,
} from '../../lib/styled/styleFunctions'

interface SearchModalNoteResultItemProps {
  note: NoteDoc
  navigateToNote: (noteId: string) => void
}

const SearchModalNoteResultItem = ({
  note,
  navigateToNote,
}: SearchModalNoteResultItemProps) => {
  const navigate = useCallback(() => {
    navigateToNote(note._id)
  }, [navigateToNote, note._id])

  return (
    <Container onClick={navigate}>
      <div className='header'>
        <div className='icon'>
          <Icon path={mdiTextBoxOutline} />
        </div>
        <div className='title'>{note.title}</div>
      </div>
      <div className='meta'>
        <div className='folderPathname'>
          <Icon className='icon' path={mdiFolder} />
          {note.folderPathname}
        </div>
        {note.tags.length > 0 && (
          <div className='tags'>
            <Icon className='icon' path={mdiTagMultiple} />{' '}
            {note.tags.map((tag) => tag).join(', ')}
          </div>
        )}
      </div>
    </Container>
  )
}

export default SearchModalNoteResultItem

const Container = styled.div`
  padding: 10px;
  cursor: pointer;
  ${borderBottom}
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &:hover:active {
    background-color: ${({ theme }) => theme.navItemHoverActiveBackgroundColor};
  }
  & > .header {
    font-size: 18px;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    & > .icon {
      width: 18px;
      height: 18px;
      margin-right: 4px;
      ${flexCenter}
    }

    & > .title {
      flex: 1;
      ${textOverflow}
    }
  }
  & > .meta {
    font-size: 12px;
    color: ${({ theme }) => theme.navItemColor};
    display: flex;
    margin-left: 18px;

    & > .folderPathname {
      display: flex;
      align-items: center;
      max-width: 150px;
      ${textOverflow}
      &>.icon {
        margin-right: 4px;
        flex-shrink: 0;
      }
    }
    & > .tags {
      margin-left: 8px;
      display: flex;
      align-items: center;
      max-width: 150px;
      ${textOverflow}
      &>.icon {
        margin-right: 4px;
        flex-shrink: 0;
      }
    }
  }
  &:last-child {
    border-bottom: none;
  }
`

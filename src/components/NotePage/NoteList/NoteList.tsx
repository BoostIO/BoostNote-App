import React, {
  useCallback,
  KeyboardEvent,
  useRef,
  useMemo,
  useState,
  ChangeEventHandler
} from 'react'
import NoteItem from './NoteItem'
import { NoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import { mdiMagnify, mdiSquareEditOutline } from '@mdi/js'
import Icon from '../../atoms/Icon'
import {
  borderBottom,
  inputStyle,
  uiTextColor
} from '../../../lib/styled/styleFunctions'
import { useRouter } from '../../../lib/router'

export const StyledNoteListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  outline: none;
  & > ul {
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;

    li.empty {
      color: ${({ theme }) => theme.uiTextColor};
    }
  }

  .control {
    height: 50px;
    display: flex;
    padding: 8px;
    align-items: center;
    ${borderBottom}
  }

  .searchInput {
    flex: 1;
    position: relative;
    height: 32px;
    .icon {
      position: absolute;
      top: 5px;
      left: 5px;
      font-size: 20px;
      z-index: 0;
      pointer-events: none;
    }
    .input {
      position: relative;
      width: 100%;
      height: 32px;
      padding-left: 30px;
      box-sizing: border-box;
      ${inputStyle}
    }
  }
  .newNoteButton {
    width: 28px;
    height: 28px;
    font-size: 24px;
    background: transparent;
    border: none;
    ${uiTextColor}
  }

  .highlighted {
    background: rgba(217, 211, 46, 0.6);
  }
`

type NoteListProps = {
  storageId: string
  noteId?: string
  currentPathnameWithoutNoteId: string
  notes: NoteDoc[]
  createNote: () => Promise<void>
  basePathname: string
}

const NoteList = ({
  notes,
  createNote,
  storageId,
  noteId,
  basePathname,
  currentPathnameWithoutNoteId
}: NoteListProps) => {
  const router = useRouter()
  const [search, setSearchInput] = useState<string>('')

  const updateSearchInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setSearchInput(event.target.value)
    },
    [setSearchInput]
  )

  const filteredNotes = useMemo(() => {
    if (search === '') return notes
    return notes.filter(
      note =>
        note.tags.includes(search) ||
        note.title.includes(search) ||
        note.content.includes(search)
    )
  }, [search, notes])

  const currentNoteIndex = useMemo(() => {
    for (let i = 0; i < filteredNotes.length; i++) {
      if (filteredNotes[i]._id === noteId) {
        return i
      }
    }
    return 0
  }, [filteredNotes, noteId])

  const navigateUp = useCallback(() => {
    if (currentNoteIndex > 0) {
      router.push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex - 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, router, currentPathnameWithoutNoteId])

  const navigateDown = useCallback(() => {
    if (currentNoteIndex < notes.length - 1) {
      router.push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex + 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, router, currentPathnameWithoutNoteId])

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          navigateDown()
          break
        case 'ArrowUp':
          navigateUp()
          break
      }
    },
    [navigateUp, navigateDown]
  )

  const listRef = useRef<HTMLUListElement>(null)

  const focusList = useCallback(() => {
    listRef.current!.focus()
  }, [])
  return (
    <StyledNoteListContainer>
      <div className='control'>
        <div className='searchInput'>
          <input
            className='input'
            value={search}
            onChange={updateSearchInput}
            placeholder='Search Notes'
          />
          <Icon className='icon' path={mdiMagnify} />
        </div>
        <button className='newNoteButton' onClick={createNote}>
          <Icon path={mdiSquareEditOutline} />
        </button>
      </div>
      <ul tabIndex={0} onKeyDown={handleListKeyDown} ref={listRef}>
        {filteredNotes.map((note, index) => {
          const noteIsCurrentNote = index === currentNoteIndex
          return (
            <li key={note._id}>
              <NoteItem
                active={noteIsCurrentNote}
                note={note}
                storageId={storageId}
                basePathname={basePathname}
                focusList={focusList}
              />
            </li>
          )
        })}
        {filteredNotes.length === 0 ? (
          notes.length === 0 ? (
            <li className='empty'>No notes</li>
          ) : (
            <li className='empty'>No notes could be found.</li>
          )
        ) : null}
      </ul>
    </StyledNoteListContainer>
  )
}

export default NoteList

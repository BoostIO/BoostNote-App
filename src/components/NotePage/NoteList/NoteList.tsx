import React, {
  useCallback,
  KeyboardEvent,
  useRef,
  ChangeEventHandler
} from 'react'
import NoteItem from './NoteItem'
import { NoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import {
  borderBottom,
  inputStyle,
  iconColor
} from '../../../lib/styled/styleFunctions'
import { IconEdit, IconLoupe } from '../../icons'

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
      ${iconColor}
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
    ${iconColor}
  }
`

type NoteListProps = {
  storageId: string
  currentNoteIndex: number
  search: string
  notes: NoteDoc[]
  createNote: () => Promise<void>
  setSearchInput: (input: string) => void
  navigateDown: () => void
  navigateUp: () => void
  basePathname: string
}

const NoteList = ({
  notes,
  createNote,
  storageId,
  basePathname,
  search,
  currentNoteIndex,
  setSearchInput,
  navigateDown,
  navigateUp
}: NoteListProps) => {
  const updateSearchInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setSearchInput(event.target.value)
    },
    [setSearchInput]
  )

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
          <IconLoupe className='icon' size='0.8em' />
        </div>
        <button className='newNoteButton' onClick={createNote}>
          <IconEdit size='0.8em' />
        </button>
      </div>
      <ul tabIndex={0} onKeyDown={handleListKeyDown} ref={listRef}>
        {notes.map((note, index) => {
          const noteIsCurrentNote = index === currentNoteIndex
          return (
            <li key={note._id}>
              <NoteItem
                active={noteIsCurrentNote}
                note={note}
                storageId={storageId}
                basePathname={basePathname}
                focusList={focusList}
                search={search}
              />
            </li>
          )
        })}
        {notes.length === 0 ? (
          search.trim() === '' ? (
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

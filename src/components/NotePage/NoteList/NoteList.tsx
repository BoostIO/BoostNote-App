import React, { useCallback, KeyboardEvent, useRef } from 'react'
import NoteItem from './NoteItem'
import { NoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import Toolbar from '../../atoms/Toolbar'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'
import { mdiMagnify, mdiSquareEditOutline } from '@mdi/js'
import ToolbarIconInput from '../../atoms/ToolbarIconInput'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  & > ul {
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
  }
  .searchInput {
    flex: 1;
  }
`

type NoteListProps = {
  storageId: string
  notes: NoteDoc[]
  createNote: () => Promise<void>
  basePathname: string
  currentNoteIndex: number
  navigateUp: () => void
  navigateDown: () => void
}

const NoteList = ({
  notes,
  currentNoteIndex,
  createNote,
  storageId,
  basePathname,
  navigateUp,
  navigateDown
}: NoteListProps) => {
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
    <StyledContainer>
      <Toolbar>
        <ToolbarIconInput
          className='searchInput'
          iconPath={mdiMagnify}
          value={''}
          onChange={() => {}}
        />
        <ToolbarIconButton path={mdiSquareEditOutline} onClick={createNote} />
      </Toolbar>
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
              />
            </li>
          )
        })}
      </ul>
      {notes.length === 0 && <p>No notes</p>}
    </StyledContainer>
  )
}

export default NoteList

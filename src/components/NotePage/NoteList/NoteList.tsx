import React from 'react'
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
  currentNoteId?: string
  createNote: () => Promise<void>
  basePathname: string
}

const NoteList = ({
  notes,
  currentNoteId,
  createNote,
  storageId,
  basePathname
}: NoteListProps) => {
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
      <ul>
        {notes.map(note => {
          const noteIsCurrentNote = note._id === currentNoteId
          return (
            <li key={note._id}>
              <NoteItem
                active={noteIsCurrentNote}
                note={note}
                storageId={storageId}
                basePathname={basePathname}
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

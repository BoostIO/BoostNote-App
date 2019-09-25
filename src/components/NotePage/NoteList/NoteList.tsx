import React from 'react'
import NoteItem from './NoteItem'
import { NoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import Toolbar from '../../atoms/Toolbar'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'
import { mdiSquareEditOutline } from '@mdi/js'

const NoteList = styled.ul`
  margin: 0;
  padding: 0;
`

type NoteListProps = {
  storageId: string
  notes: NoteDoc[]
  currentNoteId: string | null
  createNote: () => Promise<void>
}

export default ({
  notes,
  currentNoteId,
  createNote,
  storageId
}: NoteListProps) => {
  return (
    <div>
      <Toolbar>
        <ToolbarIconButton path={mdiSquareEditOutline} onClick={createNote} />
      </Toolbar>
      <NoteList>
        {notes.map(note => {
          const noteIsCurrentNote = note._id === currentNoteId
          return (
            <NoteItem
              key={note._id}
              active={noteIsCurrentNote}
              note={note}
              storageId={storageId}
            />
          )
        })}
      </NoteList>
      {notes.length === 0 && <p>No notes</p>}
    </div>
  )
}

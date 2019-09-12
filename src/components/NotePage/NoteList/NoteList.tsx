import React from 'react'
import NoteItem from './NoteItem'
import { NoteDoc } from '../../../lib/db/types'

type NoteListProps = {
  storageId: string
  notes: NoteDoc[]
  currentNoteId: string
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
      <div>Note List</div>
      <ul>
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
      </ul>
      {notes.length === 0 && <p>No notes</p>}
      <div>
        <button onClick={createNote}>New note</button>
      </div>
    </div>
  )
}

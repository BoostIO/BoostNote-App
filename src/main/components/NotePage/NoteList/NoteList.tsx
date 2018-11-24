import React from 'react'
import { observer } from 'mobx-react'

import NoteItem from './NoteItem'
import { Note } from '../../../types'

type NoteListProps = {
  notes: Note[]
  currentNoteId: string
  createNote: () => Promise<void>
}

type NoteListState = {}

@observer
class NoteList extends React.Component<NoteListProps, NoteListState> {
  render() {
    const { notes, currentNoteId, createNote } = this.props
    return (
      <div>
        <div>Note List</div>
        <ul>
          {notes.map(note => {
            const noteIsCurrentNote = note._id === currentNoteId
            return (
              <NoteItem key={note._id} active={noteIsCurrentNote} note={note} />
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
}

export default NoteList

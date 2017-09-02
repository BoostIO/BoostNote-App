import * as React from 'react'
import { TrackableMap } from 'typed-redux-kit'
import Types from 'client/types'
import { list } from './styles'
import NoteListItem from './NoteListItem'

interface NoteListProps {
  repositoryName: string
  noteMap: TrackableMap<string, Types.Note>
}

const NoteList = ({
  repositoryName,
  noteMap,
}: NoteListProps) => (
  <div className={list}>
    {noteMap.mapToArray((note, noteId) => (
      <NoteListItem
        key={noteId}
        noteId={noteId}
        note={note}
        repositoryName={repositoryName}
      />
    ))}
  </div>
)

export default NoteList

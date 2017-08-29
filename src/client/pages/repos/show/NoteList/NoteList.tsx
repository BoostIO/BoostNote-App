import * as React from 'react'
import { TrackableMap } from 'typed-redux-kit'
import { Link } from 'client/shared'
import Types from 'client/types'

interface NoteListProps {
  repositoryName: string
  noteMap: TrackableMap<string, Types.Note>
}

class NoteList extends React.Component<NoteListProps> {
  public render () {
    return <div>
      {this.props.noteMap.mapToArray((note, noteId) => (
        <div key={noteId}><Link href={`/repos/${this.props.repositoryName}/notes/${noteId}`}>{noteId}</Link></div>
      ))}
    </div>
  }
}

export default NoteList

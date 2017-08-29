import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import { TrackableMap } from 'typed-redux-kit'
import { getRepositoryName, getNoteId } from './selectors'
import { Link } from 'client/shared'
import Types from 'client/types'

interface NoteListStateProps {
  repositoryName: string
  noteMap: TrackableMap<string, Types.Note>
}

type NoteListProps = NoteListStateProps

class NoteList extends React.Component<NoteListProps> {
  public render () {
    return <div>
      {this.props.noteMap.mapToArray((note, noteId) => (
        <div key={noteId}><Link href={`/repos/${this.props.repositoryName}/notes/${noteId}`}>{noteId}</Link></div>
      ))}
    </div>
  }
}

const mapStateToProps = (state: State): NoteListStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)

  return {
    repositoryName,
    noteMap: repository.noteMap
  }
}

export default connect(mapStateToProps, null)(NoteList)

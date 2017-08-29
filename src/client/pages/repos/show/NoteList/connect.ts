import { connect } from 'react-redux'
import { State } from 'client/redux'
import { TrackableMap } from 'typed-redux-kit'
import { getRepositoryName, getNoteId } from '../selectors'
import Types from 'client/types'

interface NoteListStateProps {
  repositoryName: string
  noteMap: TrackableMap<string, Types.Note>
}

const mapStateToProps = (state: State): NoteListStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)

  return {
    repositoryName,
    noteMap: repository.noteMap
  }
}

export default connect(mapStateToProps, null)

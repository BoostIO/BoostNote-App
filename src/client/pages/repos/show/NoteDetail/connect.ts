import { connect } from 'react-redux'
import { Actions, State } from 'client/redux'
import { getRepositoryName, getNoteId } from '../selectors'
import Types from 'client/Types'

interface NoteDetailStateProps {
  note: Types.Note
  repositoryName: string
  noteId: string
}

const mapStateToProps = (state: State): NoteDetailStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)
  const noteId = getNoteId(state)
  const note = repository.noteMap.get(noteId)

  return {
    repositoryName,
    noteId,
    note,
  }
}

const mapDispatchToProps = {
  updateNote: Actions.Pages.ReposShow.ActionCreators.updateNote
}

export default connect(mapStateToProps, mapDispatchToProps)

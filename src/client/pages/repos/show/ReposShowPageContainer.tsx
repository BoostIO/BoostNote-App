import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import ReposShowPage from './ReposShowPage'
import { TrackableMap } from 'typed-redux-kit'
import { getRepositoryName, getNoteId } from './selectors'
import { Link } from 'client/shared'
import Types from 'client/types'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'

interface ReposShowPageContainerStateProps {
  repositoryName: string
  repository: {
    noteMap: TrackableMap<string, Types.Note>
  }
  noteId: string
  note: Types.Note
}

const ReposShowPageContainer = (props: ReposShowPageContainerStateProps) => (
  <div>
    <div>RepoName: {props.repositoryName}</div>
    <div>NoteId: {String(props.noteId)}</div>
    <div>
      <NoteList/>
      <NoteDetail/>
    </div>
  </div>
)

const stateToProps = (state: State): ReposShowPageContainerStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)
  const noteId = getNoteId(state)
  const note = repository.noteMap.get(noteId)

  return {
    repositoryName,
    repository,
    noteId,
    note,
  }
}

export default connect(stateToProps)(ReposShowPageContainer)

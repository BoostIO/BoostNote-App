import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import ReposShowPage from './ReposShowPage'
import { TrackableMap } from 'typed-redux-kit'
import { getRepositoryName, getNoteId } from './selectors'

interface ReposShowPageContainerStateProps {
  repositoryName: string
  repository: {
    noteMap: TrackableMap<string, {
      content: string
    }>
  }
  noteId: string
}

const ReposShowPageContainer = (props: ReposShowPageContainerStateProps) => (
  <div>
    <div>RepoName: {props.repositoryName}</div>
    <div>NoteId: {String(props.noteId)}</div>
    <div>
      <div>{JSON.stringify(props.repository.noteMap.mapToArray((note) => note))}</div>
      <div>
      </div>
    </div>
  </div>
)

const stateToProps = (state: State): ReposShowPageContainerStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)
  const noteId = getNoteId(state)

  return {
    repositoryName,
    repository,
    noteId,
  }
}

export default connect(stateToProps)(ReposShowPageContainer)

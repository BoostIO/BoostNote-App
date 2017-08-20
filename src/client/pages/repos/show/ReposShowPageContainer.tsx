import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import ReposShowPage from './ReposShowPage'
import { TrackableMap } from 'typed-redux-kit'
import Types from 'client/Types'

interface ReposShowPageContainerStateProps {
  location: Types.Location
  repositoryName: string
  repository: {
    noteMap: TrackableMap<string, {
      content: string
    }>
  }
}

const ReposShowPageContainer = (props: ReposShowPageContainerStateProps) => (
  <div>
    {props.repositoryName}
    <div>
      <div>{JSON.stringify(props.repository.noteMap.entries())}</div>
    </div>
  </div>
)

const stateToProps = (state: State): ReposShowPageContainerStateProps => {
  const repositoryName = state.location.pathname.match(/\/repos\/(.+)/)[1]
  const repository = state.repositoryMap.get(repositoryName)
  const location = state.location

  return {
    location,
    repositoryName,
    repository,
  }
}

export default connect(stateToProps)(ReposShowPageContainer)

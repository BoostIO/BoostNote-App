import * as React from 'react'
import { connect } from 'react-redux'
import ReposListPage from './ReposListPage'
import { State } from 'client/redux'

interface ReposListPageContainerStateProps {
  repositories: string[]
}

type ReposListPageContainerProps = ReposListPageContainerStateProps

const ReposListPageContainer = ({
  repositories
}: ReposListPageContainerProps) => (
  <ReposListPage
    repositories={repositories}
  />
)

const stateToProps = (state: State): ReposListPageContainerStateProps => {
  return ({
    repositories: Array.from(state.RepositoryMap.keys())
  })
}

export default connect(stateToProps)(ReposListPageContainer)

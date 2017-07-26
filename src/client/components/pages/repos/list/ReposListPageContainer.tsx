import * as React from 'react'
import { connect } from 'react-redux'
import ReposListPage from './ReposListPage'
import {
  State,
  RepositoryMap
} from 'client/redux'

interface ReposListPageContainerStateProps {
  repositoryMap: {
    [name: string]: {}
  }
}

type ReposListPageContainerProps = ReposListPageContainerStateProps

const ReposListPageContainer = ({
  repositoryMap
}: ReposListPageContainerProps) => (
  <ReposListPage
    repositoryMap={repositoryMap}
  />
)

const stateToProps = (state: State): ReposListPageContainerStateProps => ({
  repositoryMap: state.RepositoryMap
})

export default connect(stateToProps)(ReposListPageContainer)

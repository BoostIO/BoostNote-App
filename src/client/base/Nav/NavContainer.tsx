import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import Nav from './Nav'
import { TrackableMap, TrackableRecord } from 'typed-redux-kit'
import { createSelector } from 'reselect'

interface NavContainerStateProps {
  isNavOpen: boolean
  repositories: [string, {
    noteMap: TrackableMap<string, {}>
    folderMap: TrackableMap<string, {}>
  }][]
}

type NavContainerProps = NavContainerStateProps

const NavContainer = (props: NavContainerProps) => (
  <Nav {...props} />
)

const repositoryEntriesSelector = createSelector(
  (state: State) => state.RepositoryMap,
  (repositoryMap) => Array.from(repositoryMap.entries())
)

const stateToProps = (state: State): NavContainerStateProps => ({
  isNavOpen: state.UI.isNavOpen,
  repositories: repositoryEntriesSelector(state),
})

export default connect(stateToProps)(NavContainer)

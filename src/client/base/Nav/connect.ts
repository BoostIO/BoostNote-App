import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'
import { TrackableMap, TrackableRecord } from 'typed-redux-kit'
import { createSelector } from 'reselect'
import { Actions } from 'client/redux'
import Types from 'client/Types'

interface NavContainerStateProps {
  isNavOpen: boolean
  repositories: [string, {
    noteMap: TrackableMap<string, Types.Note>
    folderMap: TrackableMap<string, Types.Folder>
  }][]
}

type NavContainerProps = NavContainerStateProps

const repositoryEntriesSelector = createSelector(
  (state: State) => state.repositoryMap,
  (repositoryMap) => repositoryMap.toEntryArray(),
)

const stateToProps = (state: State): NavContainerStateProps => ({
  isNavOpen: state.ui.isNavOpen,
  repositories: repositoryEntriesSelector(state),
})

export default connect(stateToProps)

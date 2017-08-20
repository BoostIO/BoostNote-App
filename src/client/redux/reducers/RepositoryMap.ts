import * as TypedRedux from 'typed-redux-kit'
import { State } from '../state'
import { Repository } from '../state/RepositoryMap'
import {
  ActionTypes,
  Actions
} from '../actions/RepositoryMap'

export const reducer = new TypedRedux.MappedReducer<State>()

reducer.set(ActionTypes.InitializeRepositoryMap, (state, action: Actions.InitializeRepositoryMap) => {
  const { repositoryMap } = action.payload
  state.repositoryMap = new TypedRedux.TrackableMap(repositoryMap)
  return state
})

reducer.set(ActionTypes.AddRepository, (state, action: Actions.AddRepository) => {
  const {
    name
  } = action.payload
  state.repositoryMap.set(name, Repository({}))
  return state
})

reducer.set(ActionTypes.RemoveRepository, (state, action: Actions.RemoveRepository) => {
  const {
    name
  } = action.payload
  state.repositoryMap.delete(name)
  return state
})

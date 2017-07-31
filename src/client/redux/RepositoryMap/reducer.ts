import * as TypedRedux from 'typed-redux-kit'
import {
  initialState,
  State
} from './state'
import {
  ActionTypes,
  Actions
} from './actions'

export const reducer = new TypedRedux.MappedReducer<State, ActionTypes, Actions>({
  initialState
})

reducer.set(ActionTypes.InitializeRepositoryMap, (state, action: Actions.InitializeRepositoryMap) => ({
  ...action.payload.repositoryMap
}))

reducer.set(ActionTypes.AddRepository, (state, action: Actions.AddRepository) => ({
  ...state,
  [action.payload.name]: {
    noteMap: {}
  }
}))

reducer.set(ActionTypes.RemoveRepository, (state, action: Actions.RemoveRepository) => {
  const { [action.payload.name]: deleted, ...rest } = state
  return {
    ...rest
  }
})

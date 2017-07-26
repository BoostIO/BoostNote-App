import { combineReducers } from 'redux'
import * as Location from './location'
import * as UI from './ui'
import * as Pages from './pages'
import * as RepositoryMap from './RepositoryMap'
import { State } from './state'
import { AllActions } from './actions'
import * as TypedRedux from 'typed-redux-kit'

export const reducer = new TypedRedux.MappedReducer<State, string, AllActions>()

reducer.set(Object.values(RepositoryMap.ActionTypes), (state, action: RepositoryMap.Actions) => ({
  ...state,
  RepositoryMap: RepositoryMap.reducer.reduce(state.RepositoryMap, action)
}))

reducer.set(Object.values(UI.ActionTypes), (state, action: RepositoryMap.Actions) => ({
  ...state,
  ui: UI.reducer(state.ui, action)
}))

reducer.set(Object.values(Pages.ActionTypes), (state, action: Pages.Actions) => ({
  ...state,
  pages: Pages.reducer.reduce(state.pages, action)
}))

reducer.set(Object.values(Location.ActionTypes), (state, action: RepositoryMap.Actions) => ({
  ...state,
  location: Location.reducer(state.location, action)
}))

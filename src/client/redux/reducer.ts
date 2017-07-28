import * as TypedRedux from 'typed-redux-kit'
import * as Location from './location'
import * as UI from './ui'
import * as ReposCreatePage from './pages/ReposCreate'
import * as RepositoryMap from './RepositoryMap'
import {
  State,
  initialState
} from './state'

export type AllActions = UI.Actions | Location.Actions | ReposCreatePage.Actions | RepositoryMap.Actions

export const reducer = new TypedRedux.MappedReducer<State, string, AllActions>({
  initialState
})

reducer.set(Object.values(RepositoryMap.ActionTypes), (state, action: RepositoryMap.Actions) => ({
  ...state,
  RepositoryMap: RepositoryMap.reducer.reduce(state.RepositoryMap, action)
}))

reducer.set(Object.values(UI.ActionTypes), (state, action: UI.Actions) => ({
  ...state,
  ui: UI.reducer(state.ui, action)
}))

reducer.set(Object.values(Location.ActionTypes), (state, action: Location.Actions) => ({
  ...state,
  location: Location.reducer(state.location, action)
}))

reducer.set(Object.values(ReposCreatePage.ActionTypes), (state, action: ReposCreatePage.Actions): State => ({
  ...state,
  ReposCreatePage: ReposCreatePage.reducer(state.ReposCreatePage, action)
}))

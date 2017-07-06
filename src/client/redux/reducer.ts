import { combineReducers } from 'redux'
import * as Location from './location'
import * as UI from './ui'
import * as Pages from './pages'

export const reducer = combineReducers({
  location: Location.reducer,
  ui: UI.reducer,
  pages: Pages.reducer
})

import { combineReducers } from 'redux'
import { Location } from './location'
import { UI } from './ui'

export const reducer = combineReducers({
  location: Location.reducer,
  ui: UI.reducer,
})

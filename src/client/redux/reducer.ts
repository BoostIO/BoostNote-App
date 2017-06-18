import { combineReducers } from 'redux'
import { UI } from './ui'

export const reducer = combineReducers({
  ui: UI.reducer,
})

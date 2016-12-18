import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import config from './config'
import keymap from './keymap'
import status from './status'
import storageMap from './storageMap'

const reducers = combineReducers({
  keymap,
  config,
  status,
  storageMap,
  routing: routerReducer
})

export default reducers

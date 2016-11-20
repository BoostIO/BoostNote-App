import { combineReducers, createStore } from 'redux'
import { routerReducer } from 'react-router-redux'
import { Map, OrderedMap } from 'immutable'
function config (state = {}, action) {
  return state
}

const defaultStatus = Map({
  navWidth: 150,
  noteListWidth: 200
})

function status (state = defaultStatus, action) {
  // switch (action.type) {
  //   case 'UPDATE_STATUS':
  //     return Object.assign({}, state, action.payload)
  // }
  return state
}

const defaultStorageMap = OrderedMap()

function storageMap (state = defaultStorageMap, action) {
  switch (action.type) {
    case 'LOAD_ALL_STORAGES':
      return action.payload.storageMap
    case 'UPDATE_FOLDER':
      {
        const { storageName, folderPath, folderData } = action.payload
        return state.setIn([
          storageName,
          'folders',
          folderPath
        ],
        folderData)
      }
  }
  return state
}

let reducer = combineReducers({
  config,
  status,
  storageMap,
  routing: routerReducer
})

let store = createStore(reducer)

export default store

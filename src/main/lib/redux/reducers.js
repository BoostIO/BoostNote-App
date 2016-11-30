import { combineReducers } from 'redux'
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
        const { storageName, folderName, folder } = action.payload

        return state.setIn([
          storageName,
          'folders',
          folderName
        ],
        folder)
      }
    case 'DELETE_FOLDER':
      {
        const { storageName, folderName } = action.payload
        return state.deleteIn([
          storageName,
          'folders',
          folderName
        ])
      }
    case 'CREATE_NOTE':
      {
        const { storageName, noteId, note } = action.payload
        state = state.setIn([
          storageName,
          'notes',
          noteId
        ], note)

        state = state.updateIn([
          storageName,
          'folders',
          note.get('folder'),
          'notes'
        ], noteSet => noteSet.add(noteId))

        return state
      }
    case 'UPDATE_NOTE':
      {
        const { storageName, noteId, note } = action.payload

        let oldNote = state.getIn([
          storageName,
          'notes',
          noteId
        ])

        state = state.setIn([
          storageName,
          'notes',
          noteId
        ], note)

        // note is moved to another folder
        if (oldNote.get('folder') !== note.get('folder')) {
          state = state.updateIn([
            storageName,
            'folders',
            oldNote.get('folder'),
            'notes'
          ], noteSet => noteSet.delete(noteId))

          state = state.updateIn([
            storageName,
            'folders',
            note.get('folder'),
            'notes'
          ], noteSet => noteSet.add(noteId))

          return state
        }
      }
  }
  return state
}

let reducers = combineReducers({
  config,
  status,
  storageMap,
  routing: routerReducer
})

export default reducers

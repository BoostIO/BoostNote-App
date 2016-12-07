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

        // Delete notes
        const noteSet = state.getIn([
          storageName,
          'folders',
          folderName,
          'notes'
        ])
        state = noteSet
          .reduce((state, noteId) => {
            return state.deleteIn([
              storageName,
              'notes',
              noteId
            ])
          }, state)

        return state.deleteIn([
          storageName,
          'folders',
          folderName
        ])
      }
    case 'MOVE_FOLDER':
      {
        const { storageName, folderName, newFolderName } = action.payload

        // Update note.folder attribute
        const noteSet = state.getIn([
          storageName,
          'folders',
          folderName,
          'notes'
        ])
        state = noteSet
          .reduce((state, noteId) => {
            return state.updateIn([
              storageName,
              'notes',
              noteId
            ], note => note.set('folder', newFolderName))
          }, state)

        // Remove original folder
        state = state.deleteIn([
          storageName,
          'folders',
          folderName
        ])

        // Create new folder
        return state.setIn([
          storageName,
          'folders',
          newFolderName
        ], new Map([['notes', noteSet]]))
      }
    // TODO: Need tag reducers
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
        }
        return state
      }
    case 'DELETE_NOTE':
      {
        const { storageName, noteId } = action.payload

        let oldNote = state.getIn([
          storageName,
          'notes',
          noteId
        ])

        state = state.deleteIn([
          storageName,
          'notes',
          noteId
        ])

        state = state.updateIn([
          storageName,
          'folders',
          oldNote.get('folder'),
          'notes'
        ], noteSet => noteSet.delete(noteId))

        return state
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

import { Map, OrderedMap } from 'immutable'

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
          'folderMap',
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
          'folderMap',
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
          'folderMap',
          folderName
        ])
      }
    case 'MOVE_FOLDER':
      {
        const { storageName, folderName, newFolderName } = action.payload

        // Update note.folder attribute
        const noteSet = state.getIn([
          storageName,
          'folderMap',
          folderName,
          'notes'
        ])
        state = noteSet
          .reduce((state, noteId) => {
            return state.updateIn([
              storageName,
              'noteMap',
              noteId
            ], note => note.set('folder', newFolderName))
          }, state)

        // Remove original folder
        state = state.deleteIn([
          storageName,
          'folderMap',
          folderName
        ])

        // Create new folder
        return state.setIn([
          storageName,
          'folderMap',
          newFolderName
        ], new Map([['notes', noteSet]]))
      }
    // TODO: Need tag reducers
    case 'CREATE_NOTE':
      {
        const { storageName, noteId, note } = action.payload
        state = state.setIn([
          storageName,
          'noteMap',
          noteId
        ], note)

        state = state.updateIn([
          storageName,
          'folderMap',
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
          'noteMap',
          noteId
        ])

        state = state.setIn([
          storageName,
          'noteMap',
          noteId
        ], note)

        // note is moved to another folder
        if (oldNote.get('folder') !== note.get('folder')) {
          state = state.updateIn([
            storageName,
            'folderMap',
            oldNote.get('folder'),
            'notes'
          ], noteSet => noteSet.delete(noteId))

          state = state.updateIn([
            storageName,
            'folderMap',
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
          'noteMap',
          noteId
        ])

        state = state.deleteIn([
          storageName,
          'noteMap',
          noteId
        ])

        state = state.updateIn([
          storageName,
          'folderMap',
          oldNote.get('folder'),
          'notes'
        ], noteSet => noteSet.delete(noteId))

        return state
      }
  }
  return state
}

export default storageMap

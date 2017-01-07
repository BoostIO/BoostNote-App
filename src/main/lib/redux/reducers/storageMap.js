import { Map, OrderedMap, Set } from 'immutable'

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
    case 'UPDATE_TAG':
      {
        const { storageName, tagName, tag } = action.payload

        return state.setIn([
          storageName,
          'tagMap',
          tagName
        ],
        tag)
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
              'noteMap',
              noteId
            ])
          }, state)

        return state.deleteIn([
          storageName,
          'folderMap',
          folderName
        ])
      }
    case 'DELETE_TAG':
      {
        const { storageName, tagName } = action.payload

        // Untag notes
        const noteSet = state.getIn([
          storageName,
          'tagMap',
          tagName,
          'notes'
        ])
        state = noteSet
          .reduce((state, noteId) => {
            return state.updateIn([
              storageName,
              'noteMap',
              noteId,
              'tags'
            ], tags => tags.delete(tagName))
          }, state)

        return state.deleteIn([
          storageName,
          'tagMap',
          tagName
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
    case 'RENAME_TAG':
      {
        const { storageName, tagName, newTagName } = action.payload

        // Update note.tags attribute
        const noteSet = state.getIn([
          storageName,
          'tagMap',
          tagName,
          'notes'
        ])
        state = noteSet
          .reduce((state, noteId) => {
            return state.updateIn([
              storageName,
              'noteMap',
              noteId
            ], note => note.update('tags', tags => tags.delete(tagName).add(newTagName)))
          }, state)

        state = state.deleteIn([
          storageName,
          'tagMap',
          tagName
        ])

        // Create new tag
        return state.setIn([
          storageName,
          'tagMap',
          newTagName
        ], new Map([['notes', noteSet]]))
      }
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

        state = note.get('tags')
          .reduce((sum, tag) => {
            return sum.updateIn([
              storageName,
              'tagMap',
              tag,
              'notes'
            ], noteSet => {
              if (noteSet == null) noteSet = new Set()
              return noteSet.add(noteId)
            })
          }, state)

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

        // move note if folder changed
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

        state = oldNote.get('tags')
          .reduce((sum, tag) => {
            return sum.updateIn([
              storageName,
              'tagMap',
              tag,
              'notes'
            ], noteSet => {
              if (noteSet == null) noteSet = new Set()
              return noteSet.delete(noteId)
            })
          }, state)

        state = note.get('tags')
          .reduce((sum, tag) => {
            return sum.updateIn([
              storageName,
              'tagMap',
              tag,
              'notes'
            ], noteSet => {
              if (noteSet == null) noteSet = new Set()
              return noteSet.add(noteId)
            })
          }, state)

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

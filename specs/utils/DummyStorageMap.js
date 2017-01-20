import Immutable, { OrderedMap, Set } from 'immutable'

function reviver (k, v) {
  var isIndexed = Immutable.Iterable.isIndexed(v)
  return isIndexed ? v.toSet() : v.toMap()
}

function fromJS (obj) {
  return Immutable.fromJS(obj, reviver)
}

const defaultNote = {
  content: 'test',
  folder: 'Notes',
  tags: [],
  meta: {
    title: 'test',
    preview: ''
  }
}

export default class DummyStorageMap {
  constructor () {
    this.state = OrderedMap(fromJS({
      Notebook: {
        noteMap: {},
        folderMap: {
          Note: {
            notes: []
          }
        },
        tagMap: {}
      }
    }))
  }

  getState () {
    return this.state
  }

  createNote (storageName, noteId, note, preventSideEffect = false) {
    // Add a note
    const newNote = fromJS(Object.assign({}, defaultNote, note))
    this.state = this.state.setIn([storageName, 'noteMap', noteId], newNote)

    if (!preventSideEffect) {
      // Update its folder
      this.state = this.state.updateIn([storageName, 'folderMap', newNote.get('folder'), 'notes'], noteSet => {
        if (noteSet == null) return new Set([noteId])
        return noteSet.add(noteId)
      })

      // Update its tags
      newNote.get('tags').forEach(tagName => {
        this.state = this.state.updateIn([storageName, 'tagMap', tagName, 'notes'], noteSet => {
          if (noteSet == null) return new Set([noteId])
          return noteSet.add(noteId)
        })
      })
    }

    return this
  }

  createTag (storageName, tagName) {
    this.state = this.state.updateIn([storageName, 'tagMap', tagName], tag => {
      if (tag == null) return fromJS({notes: []})
      return tag
    })

    return this
  }

  createFolder (storageName, folderName) {
    this.state = this.state.updateIn([storageName, 'folderMap', folderName], folder => {
      if (folder == null) return fromJS({notes: []})
      return folder
    })
    return this
  }
}

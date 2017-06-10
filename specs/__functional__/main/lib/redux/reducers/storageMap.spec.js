import { Map, Set } from 'immutable'
import storageMap from 'main/lib/redux/reducers/storageMap'
import DummyStorageMap from 'specs/utils/DummyStorageMap'

describe('storageMap', () => {
  it('should create a note with tags and folder', () => {
    const state = new DummyStorageMap().getState()

    const action = {
      type: 'CREATE_NOTE',
      payload: {
        storageName: 'Notebook',
        noteId: 'test',
        note: new Map({
          folder: 'Test folder',
          tags: new Set(['new', 'tag'])
        })
      }
    }

    const nextState = storageMap(state, action)
    // it should create a note
    expect(nextState.getIn(['Notebook', 'noteMap', action.payload.noteId, 'content'])).toEqual(action.payload.note.get('content'))
    // it should create a folder
    expect(nextState.hasIn(['Notebook', 'folderMap', action.payload.note.get('folder')])).toBeTruthy()
    // it should create tags
    action.payload.note.get('tags')
      .forEach(tagName => {
        expect(nextState.hasIn(['Notebook', 'tagMap', tagName])).toBeTruthy()
      })
  })

  it('should delete a folder and its notes', () => {
    const state = new DummyStorageMap()
      .createNote('Notebook', 'test', {
        folder: 'Test folder'
      })
      .createNote('Notebook', 'test2', {
        folder: 'Test folder'
      })
      .createNote('Notebook', 'test3', {
        folder: 'Another folder'
      })
      .getState()

    const action = {
      type: 'DELETE_FOLDER',
      payload: {
        storageName: 'Notebook',
        folderName: 'Test folder'
      }
    }

    const nextState = storageMap(state, action)
    // The notes, test and test2, should be deleted
    expect(nextState.hasIn(['Notebook', 'noteMap', 'test'])).toBeFalsy()
    expect(nextState.hasIn(['Notebook', 'noteMap', 'test2'])).toBeFalsy()
    // test3 should exist
    expect(nextState.hasIn(['Notebook', 'noteMap', 'test3'])).toBeTruthy()
    // it should delete tag
    expect(nextState.hasIn(['Notebook', 'folderMap', action.payload.folderName])).toBeFalsy()
  })

  it('should delete a tag and untag its notes', () => {
    const state = new DummyStorageMap()
      .createNote('Notebook', 'test', {
        tags: ['new', 'tag']
      })
      .createNote('Notebook', 'test2', {
        tags: ['new', 'tag2']
      })
      .getState()

    const action = {
      type: 'DELETE_TAG',
      payload: {
        storageName: 'Notebook',
        tagName: 'new'
      }
    }

    const nextState = storageMap(state, action)
    // it should untag all notes
    expect(nextState.getIn(['Notebook', 'noteMap', 'test', 'tags']).has('new')).toBeFalsy()
    expect(nextState.getIn(['Notebook', 'noteMap', 'test2', 'tags']).has('new')).toBeFalsy()
    // it should delete tag
    expect(nextState.hasIn(['Notebook', 'tagMap', action.payload.tagName])).toBeFalsy()
  })

  it('should move a tag and update tag attribute of its notes', () => {
    const state = new DummyStorageMap()
      .createNote('Notebook', 'test', {
        tags: ['new', 'tag']
      })
      .createNote('Notebook', 'test2', {
        tags: ['new', 'tag2']
      })
      .getState()

    const action = {
      type: 'RENAME_TAG',
      payload: {
        storageName: 'Notebook',
        tagName: 'new',
        newTagName: 'newer'
      }
    }

    const nextState = storageMap(state, action)
    // Notes should be untagged the target tag
    expect(nextState.getIn(['Notebook', 'noteMap', 'test', 'tags']).has('new')).toBeFalsy()
    expect(nextState.getIn(['Notebook', 'noteMap', 'test2', 'tags']).has('new')).toBeFalsy()
    // Notes should have the renamed tag
    expect(nextState.getIn(['Notebook', 'noteMap', 'test', 'tags']).has('newer')).toBeTruthy()
    expect(nextState.getIn(['Notebook', 'noteMap', 'test2', 'tags']).has('newer')).toBeTruthy()
    // Old tag should be deleted
    expect(nextState.hasIn(['Notebook', 'tagMap', action.payload.tagName])).toBeFalsy()
    // New Tag should be created
    expect(nextState.hasIn(['Notebook', 'tagMap', action.payload.newTagName])).toBeTruthy()
  })
})

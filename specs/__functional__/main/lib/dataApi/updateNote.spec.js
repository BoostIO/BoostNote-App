import updateNote from 'main/lib/dataAPI/updateNote'
import DummyDB from 'specs/utils/DummyDB'
import {
  NOTE_ID_PREFIX,
  TAG_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const noteId = 'testNote'
const note = {
  content: 'test',
  tags: ['test_tag'],
  folder: 'Notes',
  createdAt: new Date(),
  updatedAt: new Date()
}
const newNote = {
  meta: {
    title: 'changed'
  },
  content: 'changed',
  tags: ['changed']
}

function createdDummyNote () {
  return db.createNote(noteId, note)
}

function fetchNote (noteId) {
  return db.get(NOTE_ID_PREFIX + noteId)
}

function fetchNewTag () {
  return db.get(TAG_ID_PREFIX + newNote.tags[0])
}

describe('dataAPI.updateNote', () => {
  beforeAll(() => {
    return createdDummyNote()
  })

  it('should update note', () => {
    return updateNote(dbName, noteId, newNote)
      .then(res => {
        expect(res.note.get('content')).toEqual('changed')
        return res.id
      })
      .then(fetchNote)
      .then(res => {
        expect(res).not.toBeNull()
        expect(res.content).toEqual('changed')
        expect(res.tags[0]).toEqual('changed')
      })
      .then(fetchNewTag)
      .then(res => {
        expect(res).not.toBeNull()
        expect(res._id).toEqual(TAG_ID_PREFIX + newNote.tags[0])
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

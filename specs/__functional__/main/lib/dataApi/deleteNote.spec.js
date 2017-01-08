import deleteNote from 'main/lib/dataAPI/deleteNote'
import DummyDB from 'specs/utils/DummyDB'
import {
  NOTE_ID_PREFIX
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

function createdDummyNote () {
  return db.createNote(noteId, note)
}

function fetchNote (noteId) {
  return db.get(NOTE_ID_PREFIX + noteId)
}

describe('dataAPI.deleteNote', () => {
  beforeAll(() => {
    return createdDummyNote()
  })

  it('should delete a note', () => {
    return deleteNote(dbName, noteId)
      .then(res => {
        return res.id
      })
      .then(fetchNote)
      .then(res => {
        throw new Error('should not fired')
      })
      .catch(err => {
        expect(err.message).toEqual('missing')
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

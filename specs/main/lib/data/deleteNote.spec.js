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

export const before = t => {
  return createdDummyNote()
}

export default t => {
  return deleteNote(dbName, noteId)
    .then(res => {
      return res.id
    })
    .then(fetchNote)
    .then(res => {
      t.fail('The note should not exist.')
    })
    .catch(err => {
      if (err.name !== 'not_found') {
        throw err
      }
    })
}

export const after = t => {
  return db.destory()
}

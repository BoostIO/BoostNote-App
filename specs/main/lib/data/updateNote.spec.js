import updateNote from 'main/lib/dataAPI/updateNote'
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

export const before = t => {
  return createdDummyNote()
}

export default t => {
  return updateNote(dbName, noteId, newNote)
    .then(res => {
      t.equal(res.note.get('content'), 'changed')
      return res.id
    })
    .then(fetchNote)
    .then(res => {
      t.ok(res != null)
      t.equal(res.content, 'changed')
      t.equal(res.tags[0], 'changed')
    })
}

export const after = t => {
  return db.destory()
}

import createNote from 'main/lib/dataAPI/createNote'
import DummyDB from 'specs/utils/DummyDB'
import {
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const note = {
  meta: {},
  content: 'test',
  tags: ['test_tag'],
  folder: 'Notes',
  createdAt: new Date(),
  updatedAt: new Date()
}

function fetchNote (noteId) {
  return db.get(NOTE_ID_PREFIX + noteId)
}

export default t => {
  return createNote(dbName, note)
    .then(res => {
      t.equal(res.note.get('content'), 'test')
      return res.id
    })
    .then(fetchNote)
    .then(res => {
      t.ok(res != null)
      t.equal(res.content, 'test')
      t.equal(res.tags[0], 'test_tag')
    })
}

export const after = t => {
  return db.destory()
}

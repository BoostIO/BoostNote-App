import createNote from 'main/lib/dataAPI/createNote'
import DummyDB from 'specs/utils/DummyDB'
import {
  NOTE_ID_PREFIX,
  TAG_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const folderName = 'Test Folder'
const tagName = 'test_tag'
const note = {
  meta: {},
  content: 'test',
  tags: [tagName],
  folder: folderName,
  createdAt: new Date(),
  updatedAt: new Date()
}

function fetchNote (noteId) {
  return db.get(NOTE_ID_PREFIX + noteId)
}

function fetchTag () {
  return db.get(TAG_ID_PREFIX + tagName)
}

export default t => {
  return createNote(dbName, note)
    .then(res => {
      t.equal(res.note.get('content'), note.content)
      return res.id
    })
    .then(fetchNote)
    .then(res => {
      t.ok(res != null)
      t.equal(res.content, note.content)
      t.equal(res.folder, folderName)
      t.equal(res.tags[0], tagName)
    })
    .then(fetchTag)
    .then(doc => {
      t.equal(doc._id, TAG_ID_PREFIX + tagName)
    })
}

export const after = t => {
  return db.destory()
}

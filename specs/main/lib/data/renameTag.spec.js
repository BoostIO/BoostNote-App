import renameTag from 'main/lib/dataAPI/renameTag'
import DummyDB from 'specs/utils/DummyDB'
import {
  TAG_ID_PREFIX,
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const tagName = 'Test Tag'
const newTagName = 'Renamed Tag'
const noteId = 'testnote'
const note = {
  title: 'test',
  content: 'test\ncontent',
  tags: [tagName],
  folder: 'Notes'
}
const anotherNoteId = 'anothernote'
const anotherNote = {
  title: 'tesasdfasdft',
  content: 'tesasdfasdft\ncontent',
  tags: [tagName],
  folder: 'Notes'
}

function createDummyTag () {
  return db.createTag(tagName)
}

function createDummyNote () {
  return db.createNote(noteId, note)
}

function createAnotherDummyNote () {
  return db.createNote(anotherNoteId, anotherNote)
}

function fetchTag () {
  return db
    .get(TAG_ID_PREFIX + tagName)
}

function fetchRenamedTag () {
  return db
    .get(TAG_ID_PREFIX + newTagName)
}

function fetchNote () {
  return db
    .get(NOTE_ID_PREFIX + noteId)
}

function fetchAnotherNote () {
  return db
    .get(NOTE_ID_PREFIX + anotherNoteId)
}

export const before = t => {
  return createDummyTag()
    .then(createDummyNote)
    .then(createAnotherDummyNote)
}

export default t => {
  return renameTag(dbName, tagName, newTagName)
    .then(tag => {
      t.equal(tag.id, tagName)
    })
    .then(fetchTag)
    .then(res => {
      t.fail('The tag must be deleted.')
    })
    .catch(err => {
      if (err.name !== 'not_found') {
        throw err
      }
    })
    .then(fetchNote)
    .then(res => {
      t.ok(res.tags.indexOf(tagName) === -1)
      t.ok(res.tags.indexOf(newTagName) > -1)
    })
    .then(fetchAnotherNote)
    .then(res => {
      t.ok(res.tags.indexOf(tagName) === -1)
      t.ok(res.tags.indexOf(newTagName) > -1)
    })
    .then(fetchRenamedTag)
    .then(res => {
      t.equal(res._id, TAG_ID_PREFIX + newTagName)
    })
}

export const after = t => {
  return db.destory()
}

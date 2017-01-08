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

describe('dataAPI.renameFolder', () => {
  beforeAll(() => {
    return createDummyTag()
      .then(createDummyNote)
      .then(createAnotherDummyNote)
  })

  it('should delete old tag and create a new tag and update all notes', () => {
    return renameTag(dbName, tagName, newTagName)
      .then(tag => {
        expect(tag.id).toEqual(tagName)
      })
      .then(fetchTag)
      .then(res => {
        throw new Error('should not fired')
      })
      .catch(err => {
        expect(err.message).toEqual('missing')
      })
      .then(fetchNote)
      .then(res => {
        expect(res.tags.indexOf(tagName) === -1).toBeTruthy()
        expect(res.tags.indexOf(newTagName) > -1).toBeTruthy()
      })
      .then(fetchAnotherNote)
      .then(res => {
        expect(res.tags.indexOf(tagName) === -1).toBeTruthy()
        expect(res.tags.indexOf(newTagName) > -1).toBeTruthy()
      })
      .then(fetchRenamedTag)
      .then(res => {
        expect(res._id).toEqual(TAG_ID_PREFIX + newTagName)
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

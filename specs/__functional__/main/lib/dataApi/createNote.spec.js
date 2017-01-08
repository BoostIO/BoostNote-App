import createNote from 'main/lib/dataAPI/createNote'
import DummyDB from 'specs/utils/DummyDB'
import {
  NOTE_ID_PREFIX,
  TAG_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

function fetchNote (noteId) {
  return db.get(NOTE_ID_PREFIX + noteId)
}

function fetchTag () {
  return db.get(TAG_ID_PREFIX + tagName)
}

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

describe('dataApi.createNote', () => {
  it('should create a note', () => {
    return createNote(dbName, note)
      .then(res => {
        expect(res.note.get('content')).toEqual(note.content)
        return res.id
      })
      .then(fetchNote)
      .then(res => {
        expect(res).not.toBeNull()
        expect(res.content).toEqual(note.content)
        expect(res.folder).toEqual(folderName)
        expect(res.tags[0]).toEqual(tagName)
      })
      .then(fetchTag)
      .then(doc => {
        expect(doc._id).toEqual(TAG_ID_PREFIX + tagName)
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

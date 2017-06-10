import deleteTag from 'main/lib/dataAPI/deleteTag'
import DummyDB from 'specs/utils/DummyDB'
import {
  TAG_ID_PREFIX,
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const tagName = 'Testt Tag'
const noteId = 'testnote'
const note = {
  title: 'test',
  content: 'test\ncontent',
  tags: [tagName]
}

function createDummyTag () {
  return db.createTag(tagName)
}

function createDummyNote () {
  return db.createNote(noteId, note)
}

function fetchNote () {
  return db.get(NOTE_ID_PREFIX + noteId)
}

function fetchTag () {
  return db
    .get(TAG_ID_PREFIX + tagName)
}

function createWrongView () {
  return db.get('_design/notes')
    .catch(err => {
      if (err.name !== 'not_found') throw err
    })
    .then(doc => {
      return db.put(Object.assign({}, doc, {
        _id: '_design/notes',
        views: {}
      }))
    })
}

describe('dataAPI.deleteTag', () => {
  beforeAll(() => {
    return createDummyTag()
      .then(createDummyNote)
      .then(createWrongView)
  })

  it('should delete a tag and untag its notes', () => {
    return deleteTag(dbName, tagName)
      .then(tag => {
        expect(tag.id).toEqual(tagName)
      })
      .then(fetchNote)
      .then(res => {
        expect(res.tags.length).toEqual(0)
      })
      .then(fetchTag)
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

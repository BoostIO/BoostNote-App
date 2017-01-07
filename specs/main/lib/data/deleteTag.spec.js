import deleteTag from 'main/lib/dataAPI/deleteTag'
import DummyDB from 'specs/utils/DummyDB'
import {
  FOLDER_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const tagName = 'Testt Tag'
const noteId = 'testnote'
const note = {
  title: 'test',
  content: 'test\ncontent',
  tags: ['test_tag'],
  tag: tagName
}

function createDummyTag () {
  return db.createTag(tagName)
}

function createDummyNote () {
  return db.createNote(noteId, note)
}

function fetchTag () {
  return db
    .get(FOLDER_ID_PREFIX + tagName)
}

export const before = t => {
  return createDummyTag()
    .then(createDummyNote)
}

export default t => {
  return deleteTag(dbName, tagName)
    .then(tag => {
      t.equal(tag.id, tagName)
    })
    .then(fetchTag)
    .then(res => {
      t.fail('The tag should not exist.')
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

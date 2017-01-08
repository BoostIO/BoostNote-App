import deleteFolder from 'main/lib/dataAPI/deleteFolder'
import DummyDB from 'specs/utils/DummyDB'
import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const folderName = 'Testt Folder'
const noteId = 'testnote'
const note = {
  title: 'test',
  content: 'test\ncontent',
  tags: ['test_tag'],
  folder: folderName
}

function createDummyFolder () {
  return db.createFolder(folderName)
}

function createDummyNote () {
  return db.createNote(noteId, note)
}

function fetchFolder () {
  return db
    .get(FOLDER_ID_PREFIX + folderName)
}

function fetchNote () {
  return db
    .get(NOTE_ID_PREFIX + noteId)
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

describe('dataAPI.deleteFolder', () => {
  beforeAll(() => {
    return createDummyFolder()
      .then(createDummyNote)
      .then(createWrongView)
  })

  it('should delete folder and its notes', () => {
    return deleteFolder(dbName, folderName)
      .then(folder => {
        expect(folder.id).toEqual(folderName)
      })
      .then(fetchFolder)
      .then(res => {
        throw new Error('should not fired')
      })
      .catch(err => {
        expect(err.message).toEqual('missing')
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

import renameFolder from 'main/lib/dataAPI/renameFolder'
import DummyDB from 'specs/utils/DummyDB'
import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

const folderName = 'Testt Folder'
const newFolderName = 'Renamed Folder'
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

function fetchRenamedFolder () {
  return db
    .get(FOLDER_ID_PREFIX + newFolderName)
}

function fetchNote () {
  return db
    .get(NOTE_ID_PREFIX + noteId)
}

describe('dataAPI.renameFolder', () => {
  beforeAll(() => {
    return createDummyFolder()
      .then(createDummyNote)
  })

  it('should delete old folder and create a new folder and move all notes to the new folder', () => {
    return renameFolder(dbName, folderName, newFolderName)
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
        expect(res.folder).toEqual(newFolderName)
      })
      .then(fetchRenamedFolder)
      .then(res => {
        expect(res._id).toEqual(FOLDER_ID_PREFIX + newFolderName)
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

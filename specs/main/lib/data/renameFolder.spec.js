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

export const before = t => {
  return createDummyFolder()
    .then(createDummyNote)
}

export default t => {
  return renameFolder(dbName, folderName, newFolderName)
    .then(folder => {
      t.equal(folder.id, folderName)
    })
    .then(fetchFolder)
    .then(res => {
      t.fail('The folder must not exist.')
    })
    .catch(err => {
      if (err.name !== 'not_found') {
        throw err
      }
    })
    .then(fetchNote)
    .then(res => {
      t.equal(res.folder, newFolderName)
    })
    .then(fetchRenamedFolder)
    .then(res => {
      t.equal(res._id, FOLDER_ID_PREFIX + newFolderName)
    })
}

export const after = t => {
  return db.destory()
}

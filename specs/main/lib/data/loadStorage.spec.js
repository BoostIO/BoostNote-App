import loadStorage from 'main/lib/dataAPI/loadStorage'
import DummyDB from 'specs/utils/DummyDB'

const dbName = __filename
const db = new DummyDB(dbName)

const folderName = 'Test Folder'
const noteId = 'testnote'
const note = {
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

export const before = t => {
  return createDummyFolder(folderName)
    .then(createDummyNote)
}

export default t => {
  return loadStorage(dbName)
    .then(storageMap => {
      t.ok(storageMap.has('noteMap'))
      t.ok(storageMap.has('folderMap'))
      t.ok(storageMap.hasIn(['folderMap', folderName]))
      t.ok(storageMap.hasIn(['folderMap', folderName, 'notes']))
      t.ok(storageMap.getIn(['folderMap', folderName, 'notes']).includes(noteId))
      t.ok(storageMap.hasIn(['tagMap']))
      t.ok(storageMap.hasIn(['tagMap', 'test_tag', 'notes']))
      t.equal(storageMap.getIn(['tagMap', 'test_tag', 'notes']).first(), noteId)
    })
}

export const after = t => {
  return db.destory()
}

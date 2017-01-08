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

describe('dataAPI.loadStorage', () => {
  beforeAll(() => {
    return createDummyFolder(folderName)
      .then(createDummyNote)
  })

  it('should load a storage', () => {
    return loadStorage(dbName)
      .then(storageMap => {
        expect(storageMap.has('noteMap')).toBeTruthy()
        expect(storageMap.has('folderMap')).toBeTruthy()
        expect(storageMap.hasIn(['folderMap', folderName])).toBeTruthy()
        expect(storageMap.hasIn(['folderMap', folderName, 'notes'])).toBeTruthy()
        expect(storageMap.getIn(['folderMap', folderName, 'notes']).includes(noteId)).toBeTruthy()
        expect(storageMap.hasIn(['tagMap'])).toBeTruthy()
        expect(storageMap.hasIn(['tagMap', 'test_tag', 'notes'])).toBeTruthy()
        expect(storageMap.getIn(['tagMap', 'test_tag', 'notes']).first()).toEqual(noteId)
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

import upsertFolder from 'main/lib/dataAPI/upsertFolder'
import DummyDB from 'specs/utils/DummyDB'
import {
  FOLDER_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

function fetchFolder () {
  return db
    .get(FOLDER_ID_PREFIX + 'Test Folder')
}

describe('dataAPI.upsertFolder', () => {
  it('should create a folder', () => {
    return upsertFolder(dbName, 'Test Folder')
      .then(folder => {
        expect(folder.id).toEqual('Test Folder')
      })
      .then(fetchFolder)
      .then(res => {
        expect(res).not.toBeNull()
      })
  })

  afterAll(() => {
    return db.destory()
  })
})

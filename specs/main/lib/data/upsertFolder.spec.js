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

export default t => {
  return upsertFolder(dbName, 'Test Folder')
    .then(folder => {
      t.equal(folder.id, 'Test Folder')
    })
    .then(fetchFolder)
    .then(res => {
      t.ok(res != null)
    })
}

export const after = t => {
  return db.destory()
}

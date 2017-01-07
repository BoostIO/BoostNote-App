import upsertTag from 'main/lib/dataAPI/upsertTag'
import DummyDB from 'specs/utils/DummyDB'
import {
  TAG_ID_PREFIX
} from 'main/lib/dataAPI/consts'

const dbName = __filename
const db = new DummyDB(dbName)

function fetchTag () {
  return db
    .get(TAG_ID_PREFIX + 'Test_tag')
}

export default t => {
  return upsertTag(dbName, 'Test_tag')
    .then(tag => {
      t.equal(tag.id, 'Test_tag')
    })
    .then(fetchTag)
    .then(res => {
      t.ok(res != null)
    })
}

export const after = t => {
  return db.destory()
}

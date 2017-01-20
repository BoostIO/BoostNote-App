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

describe('dataAPI.upsertTag', () => {
  it('should create a tag', () => {
    return upsertTag(dbName, 'Test_tag')
      .then(tag => {
        expect(tag.id).toEqual('Test_tag')
      })
      .then(fetchTag)
      .then(res => {
        expect(res != null).toBeTruthy()
      })
  })
  afterAll(() => {
    return db.destory()
  })
})

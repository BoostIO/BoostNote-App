import assert from 'assert'
import StorageManager from './StorageManager'
// import _ from 'lodash'

export default t => {
  let listTest = StorageManager.list()
    .then((map) => {
      assert.ok(map.size > 0, 'At least, one db should exist')
      assert.ok(map.has('notebook'), 'Default DB, notebook, should exist.')
    })

  let loadAllTest = StorageManager.loadAll()
      .then(storageListMap => {
        assert.ok(storageListMap.size > 0)
        assert.ok(storageListMap.get('notebook').has('notes'))
        assert.ok(storageListMap.get('notebook').has('folders'))
      })

  return Promise.all([
    listTest,
    loadAllTest
  ])
}

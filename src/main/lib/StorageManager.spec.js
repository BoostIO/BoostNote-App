import StorageManager from './StorageManager'
// import _ from 'lodash'
import { Map, Set } from 'immutable'

export default t => {
  let listTest = StorageManager.list()
    .then((map) => {
      t.ok(map.size > 0, 'At least, one db should exist')
      t.ok(map.has('notebook'), 'Default DB, notebook, should exist.')
    })

  let loadAllTest = StorageManager.loadAll()
      .then(storageMap => {
        t.ok(storageMap.size > 0)
        t.ok(storageMap.get('notebook').has('notes'))
        t.ok(storageMap.get('notebook').has('folders'))
      })

  let folderRev = null
  let createAndDeleteFolderTest = StorageManager.upsertFolder('notebook', 'test-folder')
    .then(data => {
      const { folder, id } = data
      t.ok(folder instanceof Map)
      t.ok(folder.has('rev'))
      t.equal(id, 'test-folder')

      folderRev = folder.get('rev')

      return StorageManager.list()
        .then(storageDBMap => {
          return storageDBMap.get('notebook').get('folder:test-folder')
        })
    })
    .then(folderDoc => {
      t.equal(folderDoc._rev, folderRev)
    })
    .then(() => {
      // Delete test
      return StorageManager.deleteFolder('notebook', 'test-folder')
    })
    .then(res => {
      t.ok(res.id, 'test-folder')
      return StorageManager.list()
        .then(storageDBMap => {
          return storageDBMap.get('notebook').get('folder:test-folder')
        })
        .catch((err) => {
          t.equal(err.name, 'not_found')
        })
    })

  let createUpdateDeleteNoteTest = StorageManager
    .createNote('notebook', {
      title: 'test',
      content: '# test',
      tags: ['abc'],
      folder: 'test-folder2'
    })
    .then(data => {
      const { note, id } = data
      t.ok(note instanceof Map)
      t.equal(note.get('title'), 'test')
      t.equal(note.get('content'), '# test')
      t.ok(note.get('tags') instanceof Set)
      t.ok(note.get('tags').has('abc'))
      t.equal(note.get('folder'), 'test-folder2')
      return id
    })
    .then(noteId => {
      return StorageManager
        .updateNote('notebook', noteId, {
          title: 'test2'
        })
    })
    .then(data => {
      t.equal(data.note.get('title'), 'test2')
      t.equal(data.note.get('content'), '# test')

      return data.id
    })
    .then(noteId => {
      return StorageManager
        .deleteNote('notebook', noteId)
        .then(data => {
          t.equal(data.id, noteId)

          return StorageManager.list()
            .then(storageDBMap => {
              return storageDBMap.get('notebook').get('note:' + noteId)
            })
            .catch((err) => {
              t.equal(err.name, 'not_found')
            })
        })
    })

  return Promise.all([
    listTest,
    loadAllTest,
    createAndDeleteFolderTest,
    createUpdateDeleteNoteTest
  ])
}

import StorageManager from 'main/lib/StorageManager'
import { Map, Set } from 'immutable'

export default t => {
  let listTest = Promise.resolve(StorageManager.list())
    .then((map) => {
      t.ok(map.size > 0, 'At least, one db should exist')
      t.ok(map.has('Test Notebook'), 'Default DB, Test Notebook, should exist.')
    })

  let loadAllTest = StorageManager.loadAll()
      .then(storageMap => {
        t.ok(storageMap.size > 0)
        t.ok(storageMap.get('Test Notebook').has('notes'))
        t.ok(storageMap.get('Test Notebook').has('folders'))
      })

  let folderRev = null
  let createAndDeleteFolderTest = StorageManager.upsertFolder('Test Notebook', 'test-folder')
    .then(data => {
      const { folder, id } = data
      t.ok(folder instanceof Map)
      t.ok(folder.has('rev'))
      t.equal(id, 'test-folder')

      folderRev = folder.get('rev')

      return Promise.resolve(StorageManager.list())
        .then(storageDBMap => {
          return storageDBMap.get('Test Notebook').get('folder:test-folder')
        })
    })
    .then(folderDoc => {
      t.equal(folderDoc._rev, folderRev)
    })
    .then(() => {
      // Delete test
      return StorageManager.deleteFolder('Test Notebook', 'test-folder')
    })
    .then(res => {
      t.ok(res.id, 'test-folder')
      return Promise.resolve(StorageManager.list())
        .then(storageDBMap => {
          return storageDBMap.get('Test Notebook').get('folder:test-folder')
        })
        .catch((err) => {
          t.equal(err.name, 'not_found')
        })
    })

  let createUpdateDeleteNoteTest = StorageManager
    .createNote('Test Notebook', {
      meta: {
        title: 'test'
      },
      content: '# test',
      tags: ['abc'],
      folder: 'test-folder2'
    })
    .then(data => {
      const { note, id } = data
      t.ok(note instanceof Map)
      t.equal(note.getIn(['meta', 'title']), 'test')
      t.equal(note.get('content'), '# test')
      t.ok(note.get('tags') instanceof Set)
      t.ok(note.get('tags').has('abc'))
      t.equal(note.get('folder'), 'test-folder2')
      return id
    })
    .then(noteId => {
      return StorageManager
        .updateNote('Test Notebook', noteId, {
          meta: {
            title: 'test2'
          }
        })
    })
    .then(data => {
      t.equal(data.note.getIn(['meta', 'title']), 'test2')
      t.equal(data.note.get('content'), '# test')

      return data.id
    })
    .then(noteId => {
      return StorageManager
        .deleteNote('Test Notebook', noteId)
        .then(data => {
          t.equal(data.id, noteId)

          return Promise.resolve(StorageManager.list())
            .then(storageDBMap => {
              return storageDBMap.get('Test Notebook').get('note:' + noteId)
            })
            .catch((err) => {
              t.equal(err.name, 'not_found')
            })
        })
    })

  let createDummyNote = StorageManager
    .createNote('Test Notebook', {
      title: 'test',
      content: '# test',
      tags: ['abc'],
      folder: 'test-folder3'
    })
  let createDummyFolder = StorageManager.upsertFolder('Test Notebook', 'test-folder3')

  let folderDeleteTest = Promise.all([createDummyNote, createDummyFolder])
    .then(data => {
      let note = data[0]
      return StorageManager.deleteFolder('Test Notebook', 'test-folder3')
        .then(res => {
          return Promise.resolve(StorageManager.list())
            .then(storageDBMap => {
              return storageDBMap.get('Test Notebook').get('note:' + note.id)
            })
        })
        .then(doc => {
          t.fail('The note still exists', 'The note should be deleted and this statement shouldn\'t be fired')
        })
        .catch(err => {
          if (err.name === 'not_found') {
            t.ok(true)
            return
          }
          throw err
        })
    })

  // Create dummy for folder renaming test
  let createAnotherDummyNote = StorageManager
    .createNote('Test Notebook', {
      title: 'test',
      content: '# test',
      tags: ['abc'],
      folder: 'test-folder4'
    })
  let createAnotherDummyFolder = StorageManager.upsertFolder('Test Notebook', 'test-folder4')

  /**
   * Rename folder
   * - check notes in the target folder is moved
   * - check new folder is created with the new name
   * - check original folder is deleted
   *
   * TODO: THE BELOW CODE MUST BE REWRITTEN.
   */
  let folderRenameTest = Promise.all([createAnotherDummyNote, createAnotherDummyFolder])
    .then(data => {
      let note = data[0]
      return StorageManager.renameFolder('Test Notebook', 'test-folder4', 'test-folder5')
        .then(res => {
          return Promise.resolve(StorageManager.list())
            .then(storageDBMap => {
              return storageDBMap.get('Test Notebook').get('note:' + note.id)
            })
        })
        .then(doc => {
          t.equal(doc.folder, 'test-folder5')
        })
        .then(() => {
          return Promise.resolve(StorageManager.list())
            .then(storageDBMap => {
              return Promise.all([
                storageDBMap.get('Test Notebook').get('folder:test-folder4')
                  .then(doc => {
                    t.fail('The folder still exists', 'The folder should be deleted and this statement shouldn\'t be fired')
                  })
                  .catch(err => {
                    if (err.name === 'not_found') {
                      t.ok(true)
                      return
                    }
                    throw err
                  }),
                storageDBMap.get('Test Notebook').get('folder:test-folder5')
                  .then(doc => {
                    t.ok(doc != null)
                  })
              ])
            })
        })
    })

  return Promise.all([
    listTest,
    loadAllTest,
    createAndDeleteFolderTest,
    createUpdateDeleteNoteTest,
    folderDeleteTest,
    folderRenameTest
  ])
}

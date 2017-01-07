import { getDB } from './context'
import {
  FOLDER_ID_PREFIX,
  notesView
} from './consts'

export default function renameFolder (name, folderName, newFolderName) {
  const db = getDB(name)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .then(doc => {
      doc._deleted = true
      return db.put(doc)
    })
    .then(res => {
      return db.get(FOLDER_ID_PREFIX + newFolderName)
    })
    .catch(err => {
      if (err.name === 'not_found') return {}
      throw err
    })
    .then(doc => {
      return db.put(Object.assign({
        _id: FOLDER_ID_PREFIX + newFolderName
      }, doc))
    })
    .then(res => {
      return db.put(notesView)
        .catch(err => {
          if (err.name !== 'conflict') throw err
        })
        .then(() => {
          return db.query('notes/by_folder', {
            key: folderName,
            include_docs: true
          })
        })
        .then(function (result) {
          let docs = result.rows.map(row => {
            row.doc.folder = newFolderName
            return row.doc
          })
          return db.bulkDocs(docs)
        })
    })
    .then(res => {
      return {
        id: folderName
      }
    })
}

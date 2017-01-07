import { getDB } from './context'
import {
  FOLDER_ID_PREFIX,
  noteView
} from './consts'

export default function deleteFolder (storageName, folderName) {
  const db = getDB(storageName)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .then(doc => {
      doc._deleted = true
      return db.put(doc)
    })
    .then(res => {
      return db.put(noteView)
        .catch(err => {
          if (err.name !== 'conflict') throw err
        })
        .then(res => {
          return db.query('notes/by_folder', {
            key: folderName,
            include_docs: true
          })
        })
        .then(function (result) {
          let docs = result.rows.map(row => {
            row.doc._deleted = true
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

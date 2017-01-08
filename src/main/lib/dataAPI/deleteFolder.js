import { getDB } from './context'
import {
  FOLDER_ID_PREFIX,
  notesView
} from './consts'

export default function deleteFolder (storageName, folderName) {
  const db = getDB(storageName)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .then(doc => {
      doc._deleted = true
      return db.put(doc)
    })
    .catch(err => {
      if (err.name !== 'not_found') throw err
    })
    .then(res => {
      return db.put(notesView)
        .catch(err => {
          if (err.name !== 'conflict') throw err
        })
        .then(res => {
          return db.query('notes/by_folder', {
            key: folderName,
            include_docs: true
          })
        })
        .catch(err => {
          if (err.message === 'ddoc notes has no view named by_folder') {
            return db.get(notesView._id)
              .then(ddoc => {
                return db.put(Object.assign(ddoc, notesView))
              })
              .then(res => {
                return db.query('notes/by_folder', {
                  key: folderName,
                  include_docs: true
                })
              })
          }
          throw err
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

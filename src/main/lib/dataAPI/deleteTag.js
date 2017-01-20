import { getDB } from './context'
import {
  TAG_ID_PREFIX,
  notesView
} from './consts'

export default function deleteTag (storageName, tagName) {
  const db = getDB(storageName)
  return db
    .get(TAG_ID_PREFIX + tagName)
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
          if (err.name === 'conflict') {
            return
          }
          throw err
        })
        .then(res => {
          return db.query('notes/by_tag', {
            key: tagName,
            include_docs: true
          })
        })
        .catch(err => {
          if (err.message === 'ddoc notes has no view named by_tag') {
            return db.get(notesView._id)
              .then(ddoc => {
                return db.put(Object.assign(ddoc, notesView))
              })
              .then(res => {
                return db.query('notes/by_tag', {
                  key: tagName,
                  include_docs: true
                })
              })
          }
          throw err
        })
        .then(function (result) {
          let docs = result.rows.map(row => {
            row.doc.tags = row.doc.tags
              .filter(tag => tag !== tagName)

            return row.doc
          })
          return db.bulkDocs(docs)
        })
    })
    .then(res => {
      return {
        id: tagName
      }
    })
}

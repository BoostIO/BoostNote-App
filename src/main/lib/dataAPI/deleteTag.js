import { getDB } from './context'
import {
  TAG_ID_PREFIX,
  noteView
} from './consts'

export default function deleteTag (storageName, tagName) {
  const db = getDB(storageName)
  return db
    .get(TAG_ID_PREFIX + tagName)
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
          return db.query('notes/by_tag', {
            key: tagName,
            include_docs: true
          })
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
    .then((res) => {
      return {
        id: tagName
      }
    })
}

/**
 * TODO: Rename tag
 * 1. find all notes with target tag
 * 2. delete old tag
 * 3. create new tag
 * 4. apply to notes
 */

import { getDB } from './context'
import {
  TAG_ID_PREFIX,
  notesView
} from './consts'

export default function renameTag (name, tagName, newTagName) {
  const db = getDB(name)
  return db
    .get(TAG_ID_PREFIX + tagName)
    .then(doc => {
      doc._deleted = true
      return db.put(doc)
    })
    .then(res => {
      return db.get(TAG_ID_PREFIX + newTagName)
    })
    .catch(err => {
      if (err.name === 'not_found') return {}
      throw err
    })
    .then(doc => {
      return db.put(Object.assign({
        _id: TAG_ID_PREFIX + newTagName
      }, doc))
    })
    .then(res => {
      return db.put(notesView)
        .catch(err => {
          if (err.name !== 'conflict') throw err
        })
        .then(() => {
          return db.query('notes/by_tag', {
            key: tagName,
            include_docs: true
          })
        })
        .then(function (result) {
          let docs = result.rows.map(row => {
            row.doc.tags = row.doc.tags
              .filter(tag => tag !== tagName && tag !== newTagName)
              .concat([newTagName])

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

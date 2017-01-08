import { getDB } from './context'
import {
  NOTE_ID_PREFIX,
  TAG_ID_PREFIX
} from './consts'
import { Map, Set } from 'immutable'
import _ from 'lodash'

export default function updateNote (storageName, noteId, payload) {
  const db = getDB(storageName)

  return db.get(NOTE_ID_PREFIX + noteId)
    .then(doc => {
      payload = Object.assign({}, doc,
        _.pick(payload, ['meta', 'content', 'tags', 'folder']),
        {
          _id: doc._id,
          _rev: doc._rev,
          updatedAt: new Date().toJSON()
        })

      return Promise
        .all(payload.tags.map(tag => {
          return db.get(TAG_ID_PREFIX + tag)
            .catch(err => {
              if (err.name === 'not_found') {
                return db.put({
                  _id: TAG_ID_PREFIX + tag
                })
              }
              throw err
            })
        }))
        .then(res => {
          return db
            .put(payload)
        })
        .then(res => {
          return {
            id: noteId,
            note: new Map({
              meta: new Map(payload.meta),
              content: payload.content,
              tags: new Set(payload.tags),
              folder: payload.folder,
              createdAt: payload.createdAt,
              updatedAt: payload.updatedAt,
              rev: res.rev
            })
          }
        })
    })
}

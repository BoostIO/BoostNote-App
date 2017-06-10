import { getDB } from './context'
import {
  NOTE_ID_PREFIX,
  FOLDER_ID_PREFIX,
  TAG_ID_PREFIX
} from './consts'
import { Map, Set } from 'immutable'
import util from 'lib/util'

export default function createNote (storageName, payload) {
  const db = getDB(storageName)

  function genNoteId () {
    let id = util.randomBytes()
    return db.get(NOTE_ID_PREFIX + id)
      .then(doc => {
        if (doc == null) return id
        return genNoteId()
      })
      .catch((err) => {
        if (err.name === 'not_found') return id
        throw err
      })
  }

  const now = new Date().toJSON()

  return genNoteId()
    .then(noteId => {
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
          return db.get(FOLDER_ID_PREFIX + payload.folder)
            .catch(err => {
              if (err.name === 'not_found') {
                return db.put({
                  _id: FOLDER_ID_PREFIX + payload.folder
                })
              }
              throw err
            })
        })
        .then(res => {
          return db.put(Object.assign({}, payload, {
            _id: NOTE_ID_PREFIX + noteId,
            createdAt: now,
            updatedAt: now
          }))
        })
        .then(res => {
          return {
            id: noteId,
            note: new Map({
              meta: new Map(payload.meta),
              content: payload.content,
              tags: new Set(payload.tags),
              folder: payload.folder,
              createdAt: now,
              updatedAt: now,
              rev: res.rev
            })
          }
        })
    })
}

import { getDB } from './context'
import {
  NOTE_ID_PREFIX
} from './consts'

export default function deleteNote (name, noteId) {
  const db = getDB(name)

  return db.get(NOTE_ID_PREFIX + noteId)
    .then((doc) => {
      doc._deleted = true
      return db
        .put(doc)
        .then(res => {
          return {
            id: noteId
          }
        })
    })
}

import { getDB } from './context'
import { Map, Set } from 'immutable'
import {
  NOTE_ID_PREFIX,
  FOLDER_ID_PREFIX,
  TAG_ID_PREFIX,
  isNoteId,
  isFolderId,
  isTagId,
  notesView
} from './consts'

/**
 * load dataMap from a storage
 *
 * @param  {String} name [description]
 * @return {Map} return data map of a Storage
 * including `notes` and `folders` field
 */
export default function loadStorage (name) {
  const db = getDB(name)
  return db
    .get(notesView._id)
    .catch(err => {
      if (err.name === 'not_found') return notesView
    })
    .then(doc => {
      return db.put(Object.assign(doc, notesView))
    })
    .then(res => {
      return db.allDocs({include_docs: true})
    })
    .then(data => {
      let { noteMap, folderMap, tagMap } = data.rows.reduce((sum, row) => {
        if (isNoteId.test(row.id)) {
          let noteId = row.id.substring(NOTE_ID_PREFIX.length)
          sum.noteMap = sum.noteMap.set(noteId, new Map({
            folder: row.doc.folder,
            meta: new Map(row.doc.meta),
            content: row.doc.content,
            tags: new Set(row.doc.tags),
            createdAt: row.doc.createdAt,
            updatedAt: row.doc.updatedAt
          }))
        } else if (isFolderId.test(row.id)) {
          let folderPath = row.id.substring(FOLDER_ID_PREFIX.length)
          sum.folderMap = sum.folderMap.set(folderPath, new Map({
            notes: new Set()
          }))
        } else if (isTagId.test(row.id)) {
          let tagName = row.id.substring(TAG_ID_PREFIX.length)
          sum.tagMap = sum.tagMap.set(tagName, new Map({
            notes: new Set()
          }))
        }
        return sum
      }, {
        noteMap: new Map(),
        folderMap: new Map(),
        tagMap: new Map()
      })

      noteMap.forEach((note, noteId) => {
        folderMap = folderMap.updateIn(
          [note.get('folder'), 'notes'],
          noteSet => {
            if (noteSet == null) return new Set([noteId])
            return noteSet.add(noteId)
          }
        )

        note.get('tags', [])
          .forEach(tag => {
            tagMap = tagMap.updateIn([tag, 'notes'], noteSet => {
              if (noteSet == null) return new Set([noteId])
              return noteSet.add(noteId)
            })
          })
      })

      // Each repository should have `Notes` folder by default.
      if (!folderMap.has('Notes')) {
        folderMap = folderMap.set('Notes', new Map({
          notes: new Set()
        }))
      }

      return new Map({
        noteMap,
        folderMap,
        tagMap
      })
    })
}

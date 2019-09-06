import React, { useMemo } from 'react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import {
  useRouter,
  storageRegexp,
  folderRegexp,
  tagRegexp
} from '../../lib/router'
import { useDb } from '../../lib/db'

export default () => {
  const db = useDb()
  const router = useRouter()

  const currentStorageId = useMemo(
    () => {
      const result = storageRegexp.exec(router.pathname)
      if (result == null) return ''
      const [, storageId] = result
      return storageId
    },
    [router.pathname]
  )

  const currentStorage = useMemo(
    () => {
      return db.storageMap.get(currentStorageId)
    },
    [db.storageMap, currentStorageId]
  )

  const notes = useMemo(
    () => {
      const pathname = router.pathname
      if (currentStorage == null) return []
      const folderRegexpResult = folderRegexp.exec(pathname)
      if (folderRegexpResult != null) {
        const folderPath =
          folderRegexpResult[2] == null ? '/' : `/${folderRegexpResult[2]}`
        const noteIds = [
          ...currentStorage.folderMap.get(folderPath)!.noteIdSet.values()
        ]
        return noteIds.map(noteId => currentStorage.noteMap.get(noteId)!)
      }
      const tagRegexpResult = tagRegexp.exec(pathname)
      if (tagRegexpResult != null) {
        const tag = tagRegexpResult[2]
        const noteIds = [...currentStorage.tagMap.get(tag)!.noteIdSet.values()]
        return noteIds.map(noteId => currentStorage.noteMap.get(noteId)!)
      }
      return []
    },
    [currentStorage, router.pathname]
  )

  const currentNoteId = ''
  const currentNote = null

  const createNote = async () => {}
  const updateNote = async () => {}
  const removeNote = async () => {}

  return (
    <>
      <NoteList
        notes={notes}
        currentNoteId={currentNoteId}
        createNote={createNote}
      />
      {currentNote == null ? (
        <div>No note selected</div>
      ) : (
        <NoteDetail
          storageId={currentStorageId}
          note={currentNote}
          updateNote={updateNote}
          removeNote={removeNote}
        />
      )}
    </>
  )
}

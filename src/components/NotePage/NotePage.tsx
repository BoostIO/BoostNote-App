import React, { useMemo, useCallback } from 'react'
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
  const { pathname } = useRouter()

  const currentStorageId = useMemo(
    () => {
      const result = storageRegexp.exec(pathname)
      if (result == null) return ''
      const [, storageId] = result
      return storageId
    },
    [pathname]
  )

  const currentStorage = useMemo(
    () => {
      return db.storageMap[currentStorageId]
    },
    [db.storageMap, currentStorageId]
  )

  const currentFolderPathname = useMemo(
    () => {
      const folderRegexpResult = folderRegexp.exec(pathname)
      if (folderRegexpResult != null) {
        const folderPath =
          folderRegexpResult[2] == null ? '/' : `/${folderRegexpResult[2]}`
        return folderPath
      }
      return null
    },
    [pathname]
  )

  const notes = useMemo(
    () => {
      if (currentStorage == null) return []
      if (currentFolderPathname != null) {
        const folder = currentStorage.folderMap[currentFolderPathname]
        if (folder == null) return []
        const noteIds = [...folder.noteIdSet]
        return noteIds.map(noteId => currentStorage.noteMap[noteId]!)
      }
      const tagRegexpResult = tagRegexp.exec(pathname)
      if (tagRegexpResult != null) {
        const tag = tagRegexpResult[2]
        const noteIds = [...currentStorage.tagMap[tag]!.noteIdSet]
        return noteIds.map(noteId => currentStorage.noteMap[noteId]!)
      }
      return []
    },
    [currentStorage, currentFolderPathname, pathname]
  )

  const currentNoteId = ''
  const currentNote = null

  const createNote = useCallback(
    async () => {
      const noteDoc = await db.createNote(currentStorageId, {
        folderPathname:
          currentFolderPathname == null ? '/' : currentFolderPathname
      })
      console.log(noteDoc)
    },
    [db, currentFolderPathname, currentStorageId]
  )
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

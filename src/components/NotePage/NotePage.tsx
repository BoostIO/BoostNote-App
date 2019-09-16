import React, { useMemo, useCallback } from 'react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { useRouter, tagRegexp, useNotesPathname } from '../../lib/router'
import { useDb } from '../../lib/db'
import TwoPaneLayout from './TwoPaneLayout'

export default () => {
  const db = useDb()
  const { pathname } = useRouter()

  const [
    currentStorageId,
    currentFolderPathname,
    currentNoteId
  ] = useNotesPathname()

  const currentStorage = useMemo(
    () => {
      if (currentStorageId == null) return undefined
      return db.storageMap[currentStorageId]
    },
    [db.storageMap, currentStorageId]
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

  const currentNote = useMemo(
    () => {
      if (currentStorage == null) return null
      if (currentNoteId == null) return null
      return currentStorage.noteMap[currentNoteId]
    },
    [currentNoteId, currentStorage]
  )

  const createNote = useCallback(
    async () => {
      if (currentStorageId == null) {
        return
      }
      await db.createNote(currentStorageId, {
        folderPathname:
          currentFolderPathname == null ? '/' : currentFolderPathname
      })
    },
    [db, currentFolderPathname, currentStorageId]
  )

  const removeNote = async () => {}

  return currentStorageId != null ? (
    <TwoPaneLayout
      left={
        <NoteList
          storageId={currentStorageId}
          notes={notes}
          currentNoteId={currentNoteId}
          createNote={createNote}
        />
      }
      right={
        currentNote == null ? (
          <div>No note selected</div>
        ) : (
          <NoteDetail
            storageId={currentStorageId}
            note={currentNote}
            updateNote={db.updateNote}
            removeNote={removeNote}
          />
        )
      }
    />
  ) : (
    <div>Storage does not exist</div>
  )
}

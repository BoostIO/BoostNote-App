import React, { useMemo, useCallback } from 'react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { useRouteParams, StorageNotesRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import TwoPaneLayout from '../atoms/TwoPaneLayout'

export default () => {
  const db = useDb()

  const {
    storageId,
    folderPathname,
    noteId
  } = useRouteParams() as StorageNotesRouteParams
  const currentStorage = useMemo(() => {
    if (storageId == null) return undefined
    return db.storageMap[storageId]
  }, [db.storageMap, storageId])

  const notes = useMemo(() => {
    if (currentStorage == null) return []
    if (folderPathname != null) {
      const folder = currentStorage.folderMap[folderPathname]
      if (folder == null) return []
      const noteIds = [...folder.noteIdSet]
      return noteIds
        .map(noteId => currentStorage.noteMap[noteId]!)
        .filter(note => !note.trashed)
    }

    return []
  }, [currentStorage, folderPathname])

  const currentNote = useMemo(() => {
    if (currentStorage == null) return null
    if (noteId == null) return null
    return currentStorage.noteMap[noteId]
  }, [noteId, currentStorage])

  const createNote = useCallback(async () => {
    if (storageId == null) {
      return
    }
    await db.createNote(storageId, {
      folderPathname: folderPathname == null ? '/' : folderPathname
    })
  }, [db, folderPathname, storageId])

  const removeNote = async () => {}

  return storageId != null ? (
    <TwoPaneLayout
      style={{ height: '100%' }}
      left={
        <NoteList
          storageId={storageId}
          notes={notes}
          currentNoteId={noteId}
          createNote={createNote}
        />
      }
      right={
        currentNote == null ? (
          <div>No note selected</div>
        ) : (
          <NoteDetail
            storageId={storageId}
            note={currentNote}
            updateNote={db.updateNote}
            trashNote={db.trashNote}
            removeNote={removeNote}
          />
        )
      }
    />
  ) : (
    <div>Storage does not exist</div>
  )
}

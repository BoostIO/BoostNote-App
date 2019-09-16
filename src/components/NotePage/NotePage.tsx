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
import TwoPaneLayout from './TwoPaneLayout'

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

  const [currentFolderPathname, currentNoteId] = useMemo(
    () => {
      const folderRegexpResult = folderRegexp.exec(pathname)
      if (folderRegexpResult != null) {
        const restPathname =
          folderRegexpResult[2] == null ? '' : `${folderRegexpResult[2]}`

        let noteId = ''
        const restNames = restPathname.split('/')
        const folderNames = []
        for (const index in restNames) {
          const name = restNames[index]
          if (/^note:/.test(name)) {
            noteId = name
            break
          } else {
            folderNames.push(name)
          }
        }

        return ['/' + folderNames.join('/'), noteId]
      }
      return [null, '']
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

  const currentNote = useMemo(
    () => {
      if (currentStorage == null) return null
      if (currentNoteId === '') return null
      return currentStorage.noteMap[currentNoteId]
    },
    [currentNoteId, currentStorage]
  )

  const createNote = useCallback(
    async () => {
      await db.createNote(currentStorageId, {
        folderPathname:
          currentFolderPathname == null ? '/' : currentFolderPathname
      })
    },
    [db, currentFolderPathname, currentStorageId]
  )

  const removeNote = async () => {}

  return (
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
  )
}

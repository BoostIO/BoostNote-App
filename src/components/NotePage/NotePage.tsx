import React, { useMemo, useCallback, useState } from 'react'
import NoteList from './NoteList'
import styled from '../../lib/styled'
import NoteDetail from './NoteDetail'
import {
  useRouteParams,
  StorageAllNotes,
  StorageNotesRouteParams,
  StorageTrashCanRouteParams,
  StorageTagsRouteParams,
  usePathnameWithoutNoteId,
  useRouter
} from '../../lib/router'
import { useDb } from '../../lib/db'
import TwoPaneLayout from '../atoms/TwoPaneLayout'
import { NoteDoc } from '../../lib/db/types'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import FileDropZone from '../atoms/FileDropZone'
import { convertCSONFileToNote } from '../../lib/legacy-import'

export const StyledNoteDetailNoNote = styled.div`
  text-align: center;
  margin-top: 300px;
`

function sortByUpdatedAt(a: NoteDoc, b: NoteDoc) {
  return b.updatedAt.localeCompare(a.updatedAt)
}

export default () => {
  const db = useDb()

  const routeParams = useRouteParams() as (
    | StorageAllNotes
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams)
  const { storageId, noteId } = routeParams
  const currentStorage = useMemo(() => {
    if (storageId == null) return undefined
    return db.storageMap[storageId]
  }, [db.storageMap, storageId])
  const router = useRouter()
  const [search, setSearchInput] = useState<string>('')
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

  const notes = useMemo((): NoteDoc[] => {
    if (currentStorage == null) return []
    switch (routeParams.name) {
      case 'storages.allNotes':
        return (Object.values(currentStorage.noteMap) as NoteDoc[]).filter(
          note => !note.trashed
        )
      case 'storages.notes':
        const { folderPathname } = routeParams
        const folder = currentStorage.folderMap[folderPathname]
        if (folder == null) return []
        return (Object.values(currentStorage.noteMap) as NoteDoc[])
          .filter(
            note =>
              (note.folderPathname + '/').startsWith(folder.pathname + '/') &&
              !note.trashed
          )
          .sort(sortByUpdatedAt)
      case 'storages.tags.show':
        const { tagName } = routeParams
        const tag = currentStorage.tagMap[tagName]
        if (tag == null) return []
        return [...tag.noteIdSet]
          .map(noteId => currentStorage.noteMap[noteId]!)
          .filter(note => !note.trashed)
          .sort(sortByUpdatedAt)
      case 'storages.trashCan':
        return (Object.values(currentStorage.noteMap) as NoteDoc[])
          .filter(note => note.trashed)
          .sort(sortByUpdatedAt)
    }
    return []
  }, [currentStorage, routeParams])

  const filteredNotes = useMemo(() => {
    if (search.trim() === '') return notes
    const regex = new RegExp(search, 'i')
    return notes.filter(
      note =>
        note.tags.join().match(regex) ||
        note.title.match(regex) ||
        note.content.match(regex)
    )
  }, [search, notes])

  const currentNoteIndex = useMemo(() => {
    for (let i = 0; i < filteredNotes.length; i++) {
      if (filteredNotes[i]._id === noteId) {
        return i
      }
    }
    return 0
  }, [filteredNotes, noteId])

  const currentNote = useMemo(() => {
    return filteredNotes[currentNoteIndex]
  }, [filteredNotes, currentNoteIndex])

  const createNote = useCallback(async () => {
    if (storageId == null || routeParams.name === 'storages.trashCan') {
      return
    }
    const folderPathname =
      routeParams.name === 'storages.notes' ? routeParams.folderPathname : '/'

    const tags =
      routeParams.name === 'storages.tags.show' ? [routeParams.tagName] : []
    await db.createNote(storageId, {
      folderPathname,
      tags
    })
  }, [db, routeParams, storageId])

  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth
      })
    },
    [setGeneralStatus]
  )

  const toggleSplitMode = useCallback(() => {
    setGeneralStatus(prevState => ({
      noteSplitMode: !prevState.noteSplitMode
    }))
  }, [setGeneralStatus])

  const togglePreviewMode = useCallback(() => {
    setGeneralStatus(prevState => ({
      notePreviewMode: !prevState.notePreviewMode
    }))
  }, [setGeneralStatus])

  const { messageBox } = useDialog()
  const purgeNoteFromDb = db.purgeNote
  const purgeNote = useCallback(
    (storageId: string, noteId: string) => {
      messageBox({
        title: 'Delete a Note',
        message: 'The note will be deleted permanently',
        iconType: DialogIconTypes.Warning,
        buttons: ['Delete Note', 'Cancel'],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: (value: number | null) => {
          if (value === 0) {
            purgeNoteFromDb(storageId, noteId)
          }
        }
      })
    },
    [messageBox, purgeNoteFromDb]
  )

  const importDrop = useCallback(
    (files: File[]) => {
      files.forEach(async file => {
        const result = await convertCSONFileToNote(file)
        if (!result.err) {
          db.createNote(storageId, result.data)
        } else {
          // TODO: Toast Message Error
          console.error(result.data)
        }
      })
    },
    [storageId, db]
  )

  const navigateUp = useCallback(() => {
    if (currentNoteIndex > 0) {
      router.push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex - 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, router, currentPathnameWithoutNoteId])

  const navigateDown = useCallback(() => {
    if (currentNoteIndex < filteredNotes.length - 1) {
      router.push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex + 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, router, currentPathnameWithoutNoteId])

  return storageId != null ? (
    <TwoPaneLayout
      style={{ height: '100%' }}
      defaultLeftWidth={generalStatus.noteListWidth}
      left={
        <FileDropZone style={{ height: '100%' }} onDrop={importDrop}>
          <NoteList
            search={search}
            setSearchInput={setSearchInput}
            storageId={storageId}
            notes={filteredNotes}
            createNote={createNote}
            basePathname={currentPathnameWithoutNoteId}
            navigateDown={navigateDown}
            navigateUp={navigateUp}
            currentNoteIndex={currentNoteIndex}
          />
        </FileDropZone>
      }
      right={
        currentNote == null ? (
          <StyledNoteDetailNoNote>
            <div>
              <h1>Command(⌘) + N</h1>
              <h2>to create a new note</h2>
            </div>
          </StyledNoteDetailNoNote>
        ) : (
          <NoteDetail
            storageId={storageId}
            note={currentNote}
            updateNote={db.updateNote}
            trashNote={db.trashNote}
            untrashNote={db.untrashNote}
            addAttachments={db.addAttachments}
            purgeNote={purgeNote}
            splitMode={generalStatus.noteSplitMode}
            previewMode={generalStatus.notePreviewMode}
            toggleSplitMode={toggleSplitMode}
            togglePreviewMode={togglePreviewMode}
          />
        )
      }
      onResizeEnd={updateNoteListWidth}
    />
  ) : (
    <div>Storage does not exist</div>
  )
}

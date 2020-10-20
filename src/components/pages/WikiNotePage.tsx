import React, { useCallback, useMemo } from 'react'
import { NoteStorage } from '../../lib/db/types'
import StorageLayout from '../atoms/StorageLayout'
import NotePageToolbar from '../organisms/NotePageToolbar'
import NoteDetail from '../organisms/NoteDetail'
import { useRouteParams } from '../../lib/router'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { useDb } from '../../lib/db'
import FolderDetail from '../organisms/FolderDetail'

interface WikiNotePageProps {
  storage: NoteStorage
}

const WikiNotePage = ({ storage }: WikiNotePageProps) => {
  const routeParams = useRouteParams()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const noteViewMode = generalStatus.noteViewMode
  const selectViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode,
      })
    },
    [setGeneralStatus]
  )

  const note = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null) {
          return undefined
        }
        if (!note.folderPathname.includes(routeParams.folderPathname)) {
          return undefined
        }
        return note
      }
      case 'storages.tags.show': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null) {
          return undefined
        }
        if (!note.tags.includes(routeParams.tagName)) {
          return undefined
        }
        return note
      }
      case 'storages.trashCan': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null || !note.trashed) {
          return undefined
        }
        return note
      }
    }
    return undefined
  }, [routeParams, storage.noteMap])

  const { updateNote, addAttachments } = useDb()

  return (
    <StorageLayout storage={storage}>
      <NotePageToolbar
        note={note}
        storage={storage}
        selectViewMode={selectViewMode}
        viewMode={noteViewMode}
      />
      {note == null ? (
        routeParams.name === 'storages.notes' ? (
          <FolderDetail
            storage={storage}
            folderPathname={routeParams.folderPathname}
          />
        ) : (
          <div>Idle</div>
        )
      ) : (
        <NoteDetail
          note={note}
          storage={storage}
          updateNote={updateNote}
          addAttachments={addAttachments}
          viewMode={noteViewMode}
        />
      )}
    </StorageLayout>
  )
}

export default WikiNotePage

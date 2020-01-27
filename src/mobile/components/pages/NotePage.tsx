import React, { useMemo, useCallback } from 'react'
import NoteList from '../organisms/NoteList'
import {
  useRouteParams,
  StorageAllNotes,
  StorageNotesRouteParams,
  StorageTrashCanRouteParams,
  StorageTagsRouteParams,
  usePathnameWithoutNoteId,
  useRouter,
  StorageBookmarkNotes
} from '../../../lib/router'
import { useDb } from '../../../lib/db'
import { PopulatedNoteDoc, NoteStorage, ObjectMap } from '../../../lib/db/types'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { dispatchNoteDetailFocusTitleInputEvent } from '../../../lib/events'
import TopBarLayout from '../layouts/TopBarLayout'
import NoteDetail from '../organisms/NoteDetail'
import styled from '../../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiChevronLeft } from '@mdi/js'
import TopBarButton from '../atoms/TopBarButton'
import NavTopBarButton from '../atoms/NavTopBarButton'

const NotePageContainer = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  position: relative;
`

const NotePagePannel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: left 150ms ease-in-out;
`

export default () => {
  const {
    storageMap,
    createNote,
    purgeNote,
    updateNote,
    trashNote,
    untrashNote,
    addAttachments
  } = useDb()
  const routeParams = useRouteParams() as (
    | StorageAllNotes
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams
    | StorageBookmarkNotes)
  const { storageId, noteId } = routeParams
  const currentStorage = useMemo(() => {
    if (storageId == null) return undefined
    return storageMap[storageId]
  }, [storageMap, storageId])
  const { replace, push } = useRouter()
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

  const notes = useMemo((): PopulatedNoteDoc[] => {
    if (currentStorage == null) {
      if (routeParams.name === 'storages.allNotes') {
        const allNotesMap = (Object.values(storageMap) as NoteStorage[]).reduce(
          (map, storage) => {
            ;(Object.values(storage.noteMap) as PopulatedNoteDoc[]).forEach(
              note => (map[note._id] = note)
            )
            return map
          },
          {} as ObjectMap<PopulatedNoteDoc>
        )

        return (Object.values(allNotesMap) as PopulatedNoteDoc[]).filter(
          note => !note.trashed
        )
      }
      if (routeParams.name === 'storages.bookmarks') {
        return (Object.values(storageMap) as NoteStorage[])
          .map(storage => {
            return (Object.values(
              storage.noteMap
            ) as PopulatedNoteDoc[]).filter(note => note.bookmarked)
          })
          .flat()
      }
      return []
    }
    switch (routeParams.name) {
      case 'storages.allNotes':
        return (Object.values(
          currentStorage.noteMap
        ) as PopulatedNoteDoc[]).filter(note => !note.trashed)
      case 'storages.notes':
        const { folderPathname } = routeParams
        const folder = currentStorage.folderMap[folderPathname]
        if (folder == null) return []
        return (Object.values(
          currentStorage.noteMap
        ) as PopulatedNoteDoc[]).filter(
          note =>
            (note.folderPathname + '/').startsWith(folder.pathname + '/') &&
            !note.trashed
        )
      case 'storages.tags.show':
        const { tagName } = routeParams
        const tag = currentStorage.tagMap[tagName]
        if (tag == null) return []
        return [...tag.noteIdSet]
          .map(noteId => currentStorage.noteMap[noteId]! as PopulatedNoteDoc)
          .filter(note => !note.trashed)
      case 'storages.trashCan':
        return (Object.values(
          currentStorage.noteMap
        ) as PopulatedNoteDoc[]).filter(note => note.trashed)
    }
    return []
  }, [storageMap, currentStorage, routeParams])

  const currentNote: PopulatedNoteDoc | undefined = useMemo(() => {
    if (currentStorage == null || noteId == null) {
      return undefined
    }
    return currentStorage.noteMap[noteId]
  }, [currentStorage, noteId])

  const { generalStatus, setGeneralStatus } = useGeneralStatus()

  const toggleViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode
      })
    },
    [setGeneralStatus]
  )
  const createQuickNote = useCallback(async () => {
    if (storageId == null || routeParams.name === 'storages.trashCan') {
      return
    }

    const folderIsRoot = !(routeParams.name === 'storages.notes')
    const folderPathname =
      routeParams.name === 'storages.notes' ? routeParams.folderPathname : '/'

    const tags =
      routeParams.name === 'storages.tags.show' ? [routeParams.tagName] : []

    const note = await createNote(storageId, {
      folderPathname,
      tags
    })
    if (note != null) {
      replace(
        `/app/storages/${storageId}/notes${folderPathname}${
          folderIsRoot ? '' : '/'
        }${note._id}`
      )
      dispatchNoteDetailFocusTitleInputEvent()
      toggleViewMode('edit')
    }
  }, [createNote, replace, routeParams, storageId, toggleViewMode])

  const showCreateNoteInList =
    routeParams.name === 'storages.notes' ||
    routeParams.name === 'storages.allNotes'

  const trashOrPurgeCurrentNote = useCallback(() => {
    if (currentNote == null) {
      return
    }

    if (!currentNote.trashed) {
      trashNote(currentNote.storageId, currentNote._id)
    } else {
      purgeNote(currentNote.storageId, currentNote._id)
    }
  }, [trashNote, purgeNote, currentNote])

  const backToList = useCallback(() => {
    push(currentPathnameWithoutNoteId)
  }, [push, currentPathnameWithoutNoteId])

  const noteListTitle = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.allNotes':
        return `All Notes in ${currentStorage!.name}`
      case 'storages.notes':
        return `${routeParams.folderPathname} in ${currentStorage!.name}`
      case 'storages.bookmarks':
        return 'Bookmarks'
      default:
        return 'unknown'
    }
  }, [routeParams, currentStorage])

  return (
    <NotePageContainer>
      <NotePagePannel
        style={{
          left: currentNote == null ? 0 : '-100%'
        }}
      >
        <TopBarLayout title={noteListTitle} leftControl={<NavTopBarButton />}>
          <NoteList
            currentStorageId={storageId}
            notes={notes}
            createNote={showCreateNoteInList ? createQuickNote : undefined}
            basePathname={currentPathnameWithoutNoteId}
            trashOrPurgeCurrentNote={trashOrPurgeCurrentNote}
          />
        </TopBarLayout>
      </NotePagePannel>

      <NotePagePannel
        style={{
          left: currentNote == null ? '100%' : 0
        }}
      >
        <TopBarLayout
          title=''
          leftControl={
            <TopBarButton onClick={backToList}>
              <Icon path={mdiChevronLeft} />
            </TopBarButton>
          }
        >
          <>
            {currentNote != null && (
              <NoteDetail
                currentPathnameWithoutNoteId={currentPathnameWithoutNoteId}
                note={currentNote}
                updateNote={updateNote}
                trashNote={trashNote}
                untrashNote={untrashNote}
                purgeNote={purgeNote}
                viewMode={generalStatus.noteViewMode}
                toggleViewMode={toggleViewMode}
                addAttachments={addAttachments}
              />
            )}
          </>
        </TopBarLayout>
      </NotePagePannel>
    </NotePageContainer>
  )
}

import React, { useMemo, useCallback } from 'react'
import NoteList from '../organisms/NoteList'
import {
  useRouteParams,
  StorageNotesRouteParams,
  StorageTrashCanRouteParams,
  StorageTagsRouteParams,
  usePathnameWithoutNoteId,
  useRouter,
} from '../../lib/router'
import { useDb } from '../../lib/db'
import { NoteDoc, NoteStorage } from '../../../lib/db/types'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { dispatchNoteDetailFocusTitleInputEvent } from '../../../lib/events'
import TopBarLayout from '../layouts/TopBarLayout'
import NoteDetail from '../organisms/NoteDetail'
import styled from '../../../lib/styled'
import Icon from '../../../components/atoms/Icon'
import { mdiChevronLeft, mdiEyeOutline, mdiDotsVertical } from '@mdi/js'
import TopBarButton from '../atoms/TopBarButton'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'
import { IconFileOpen, IconTrash, IconTag } from '../../../components/icons'
import { useContextMenu, MenuTypes } from '../../../lib/contextMenu'

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

interface NotePageProps {
  storage: NoteStorage
}

const NotePage = ({ storage }: NotePageProps) => {
  const {
    createNote,
    purgeNote,
    updateNote,
    trashNote,
    untrashNote,
    addAttachments,
  } = useDb()
  const routeParams = useRouteParams() as
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams
  const { storageId, noteId } = routeParams
  const { replace, push } = useRouter()
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

  const notes = useMemo((): NoteDoc[] => {
    switch (routeParams.name) {
      case 'storages.notes':
        const { folderPathname } = routeParams
        const folder = storage.folderMap[folderPathname]
        if (folder == null) return []
        return (Object.values(storage.noteMap) as NoteDoc[]).filter(
          (note) =>
            (note.folderPathname + '/').startsWith(folder.pathname + '/') &&
            !note.trashed
        )
      case 'storages.tags.show':
        const { tagName } = routeParams
        const tag = storage.tagMap[tagName]
        if (tag == null) return []
        return [...tag.noteIdSet]
          .map((noteId) => storage.noteMap[noteId]!)
          .filter((note) => !note.trashed)
      case 'storages.trashCan':
        return (Object.values(storage.noteMap) as NoteDoc[]).filter(
          (note) => note.trashed
        )
    }
    return []
  }, [storage, routeParams])

  const currentNote: NoteDoc | undefined = useMemo(() => {
    if (storage == null || noteId == null) {
      return undefined
    }
    return storage.noteMap[noteId]
  }, [storage, noteId])

  const { generalStatus, setGeneralStatus } = useGeneralStatus()

  const toggleViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode,
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
      tags,
    })
    if (note != null) {
      replace(
        `/m/storages/${storageId}/notes${folderPathname}${
          folderIsRoot ? '' : '/'
        }${note._id}`
      )
      dispatchNoteDetailFocusTitleInputEvent()
      toggleViewMode('edit')
    }
  }, [createNote, replace, routeParams, storageId, toggleViewMode])

  const showCreateNoteInList = routeParams.name === 'storages.notes'

  const trashOrPurgeCurrentNote = useCallback(() => {
    if (currentNote == null) {
      return
    }

    if (!currentNote.trashed) {
      trashNote(storage.id, currentNote._id)
    } else {
      purgeNote(storage.id, currentNote._id)
    }
  }, [trashNote, purgeNote, currentNote, storage])

  const backToList = useCallback(() => {
    push(currentPathnameWithoutNoteId)
  }, [push, currentPathnameWithoutNoteId])

  const noteListTitle = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes':
        return (
          <>
            <IconFileOpen size='1.3em' /> {routeParams.folderPathname} in{' '}
            {storage!.name}
          </>
        )
      case 'storages.tags.show':
        return (
          <>
            <IconTag size='1.3em' /> {routeParams.tagName} in {storage!.name}
          </>
        )
      case 'storages.trashCan':
        return (
          <>
            <IconTrash size='1em' /> Trashed Notes in {storage!.name}
          </>
        )
      default:
        return 'unknown'
    }
  }, [routeParams, storage])

  const toggleNoteViewMode = useCallback(() => {
    setGeneralStatus({
      noteViewMode: generalStatus.noteViewMode === 'edit' ? 'preview' : 'edit',
    })
  }, [setGeneralStatus, generalStatus])

  const { popupWithPosition } = useContextMenu()
  const openContextMenu = useCallback(() => {
    popupWithPosition({ x: 0, y: 0 }, [
      {
        type: MenuTypes.Normal,
        label: 'Delete',
        onClick: () => {
          trashOrPurgeCurrentNote()
          push(currentPathnameWithoutNoteId)
        },
      },
    ])
  }, [
    popupWithPosition,
    trashOrPurgeCurrentNote,
    push,
    currentPathnameWithoutNoteId,
  ])

  return (
    <NotePageContainer>
      <NotePagePannel
        style={{
          left: currentNote == null ? 0 : '-100%',
        }}
      >
        <TopBarLayout
          title={noteListTitle}
          leftControl={<TopBarToggleNavButton />}
        >
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
          left: currentNote == null ? '100%' : 0,
        }}
      >
        <TopBarLayout
          title={
            generalStatus.noteViewMode === 'edit' ? 'Edit Mode' : 'Preview Mode'
          }
          leftControl={
            <TopBarButton onClick={backToList}>
              <Icon path={mdiChevronLeft} />
            </TopBarButton>
          }
          rightControl={
            <>
              <TopBarButton
                onClick={toggleNoteViewMode}
                className={
                  generalStatus.noteViewMode === 'preview' ? 'active' : ''
                }
              >
                <Icon path={mdiEyeOutline} />
              </TopBarButton>

              <TopBarButton onClick={openContextMenu}>
                <Icon path={mdiDotsVertical} />
              </TopBarButton>
            </>
          }
        >
          <>
            {currentNote != null && (
              <NoteDetail
                currentPathnameWithoutNoteId={currentPathnameWithoutNoteId}
                attachmentMap={storage.attachmentMap}
                storageId={storage.id}
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

export default NotePage

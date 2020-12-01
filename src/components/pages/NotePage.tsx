import React, { useMemo, useCallback } from 'react'
import NoteDetail from '../organisms/NoteDetail'
import { useRouter } from '../../lib/router'
import {
  useRouteParams,
  StorageNotesRouteParams,
  StorageTrashCanRouteParams,
  StorageTagsRouteParams,
  usePathnameWithoutNoteId,
} from '../../lib/routeParams'
import { useDb } from '../../lib/db'
import { NoteDoc, NoteStorage, NoteDocEditibleProps } from '../../lib/db/types'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey,
} from '../../lib/keyboard'
import { dispatchNoteDetailFocusTitleInputEvent } from '../../lib/events'
import { usePreferences } from '../../lib/preferences'
import {
  sortNotesByNoteSortingOption,
  NoteSortingOptions,
} from '../../lib/sort'
import { values } from '../../lib/db/utils'
import IdleNoteDetail from '../organisms/IdleNoteDetail'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import StorageLayout from '../atoms/StorageLayout'
import NoteListNavigator from '../organisms/NoteListNavigator'
import TwoPaneLayout from '../atoms/TwoPaneLayout'
import NotePageToolbar from '../organisms/NotePageToolbar'
import SearchModal from '../organisms/SearchModal'
import { useSearchModal } from '../../lib/searchModal'
import styled from '../../lib/styled'
import { getNumberFromStr } from '../../lib/string'

interface NotePageProps {
  storage: NoteStorage
}

const NotePage = ({ storage }: NotePageProps) => {
  const {
    createNote,
    purgeNote,
    updateNote,
    trashNote,
    addAttachments,
  } = useDb()
  const routeParams = useRouteParams() as
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams
  const { noteId } = routeParams
  const { push, hash } = useRouter()
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()
  const { preferences, setPreferences } = usePreferences()
  const noteSorting = preferences['general.noteSorting']
  const showSubFolderContents = preferences['general.showSubfolderContents']
  const { report } = useAnalytics()
  const { generalStatus, setGeneralStatus } = useGeneralStatus()

  const setNoteSorting = useCallback(
    (noteSortingOption: NoteSortingOptions) => {
      setPreferences({
        'general.noteSorting': noteSortingOption,
      })
    },
    [setPreferences]
  )

  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth,
      })
    },
    [setGeneralStatus]
  )

  const updateNoteAndReport = useCallback(
    (
      storageId: string,
      noteId: string,
      noteProps: Partial<NoteDocEditibleProps>
    ) => {
      report(analyticsEvents.updateNote)
      return updateNote(storageId, noteId, noteProps)
    },
    [updateNote, report]
  )

  const getCurrentPositionFromRoute = useCallback(() => {
    let focusLine = 0
    let focusColumn = 0
    if (hash.startsWith('#L')) {
      const focusData = hash.substring(2).split(',')
      if (focusData.length == 2) {
        focusLine = getNumberFromStr(focusData[0])
        focusColumn = getNumberFromStr(focusData[1])
      } else if (focusData.length == 1) {
        focusLine = getNumberFromStr(focusData[0])
      }
    }

    return {
      line: focusLine,
      ch: focusColumn,
    }
  }, [hash])

  const notes = useMemo((): NoteDoc[] => {
    switch (routeParams.name) {
      case 'storages.notes':
        if (storage == null) return []
        const { folderPathname } = routeParams
        const noteEntries = Object.entries(storage.noteMap) as [
          string,
          NoteDoc
        ][]
        if (folderPathname === '/') {
          return noteEntries.reduce<NoteDoc[]>((notes, [_id, note]) => {
            if (!note.trashed) {
              notes.push(note)
            }
            return notes
          }, [])
        }
        const folder = storage.folderMap[folderPathname]
        if (folder == null) return []
        return noteEntries.reduce<NoteDoc[]>((notes, [_id, note]) => {
          if (showSubFolderContents) {
            if (
              (note!.folderPathname + '/').startsWith(folder.pathname + '/') &&
              !note!.trashed
            ) {
              notes.push(note)
            }
          } else {
            if (note!.folderPathname === folder.pathname && !note!.trashed) {
              notes.push(note)
            }
          }
          return notes
        }, [])
      case 'storages.tags.show':
        if (storage == null) return []
        const { tagName } = routeParams
        const tag = storage.tagMap[tagName]
        if (tag == null) return []
        return [...tag.noteIdSet]
          .map((noteId) => storage.noteMap[noteId]! as NoteDoc)
          .filter((note) => !note.trashed)
      case 'storages.trashCan':
        if (storage == null) return []
        return values(storage.noteMap).filter((note) => note.trashed)
      default:
        return []
    }
  }, [storage, routeParams, showSubFolderContents])

  const sortedNotes = useMemo(() => {
    return sortNotesByNoteSortingOption(notes, noteSorting)
  }, [notes, noteSorting])

  const currentNoteIndex = useMemo(() => {
    for (let i = 0; i < sortedNotes.length; i++) {
      if (sortedNotes[i]._id === noteId) {
        return i
      }
    }
    return 0
  }, [sortedNotes, noteId])

  const currentNote: NoteDoc | undefined = useMemo(() => {
    return sortedNotes[currentNoteIndex] != null
      ? sortedNotes[currentNoteIndex]
      : undefined
  }, [sortedNotes, currentNoteIndex])

  const selectViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode,
      })
    },
    [setGeneralStatus]
  )

  const createQuickNote = useCallback(async () => {
    if (storage.id == null || routeParams.name === 'storages.trashCan') {
      return
    }

    const folderPathname =
      routeParams.name === 'storages.notes' ? routeParams.folderPathname : '/'
    const tags =
      routeParams.name === 'storages.tags.show' ? [routeParams.tagName] : []

    report(analyticsEvents.createNote)
    const note = await createNote(storage.id, {
      folderPathname,
      tags,
    })
    if (note == null) {
      return
    }

    push(
      folderPathname === '/'
        ? `/app/storages/${storage.id}/notes/${note._id}`
        : `/app/storages/${storage.id}/notes${folderPathname}/${note._id}`
    )
    dispatchNoteDetailFocusTitleInputEvent()
  }, [createNote, push, routeParams, storage.id, report])

  useGlobalKeyDownHandler((e) => {
    switch (e.key) {
      case 'T':
      case 't':
        if (isWithGeneralCtrlKey(e) && e.shiftKey) {
          switch (generalStatus['noteViewMode']) {
            case 'edit':
              selectViewMode('split')
              break
            case 'split':
              selectViewMode('preview')
              break
            default:
              selectViewMode('edit')
              break
          }
        }
        break
    }
  })

  const { showSearchModal } = useSearchModal()

  return (
    <StorageLayout storage={storage}>
      {showSearchModal && <SearchModal storage={storage} />}
      <Conatiner>
        <NotePageToolbar
          storage={storage}
          note={currentNote}
          viewMode={generalStatus.noteViewMode}
          selectViewMode={selectViewMode}
        />
        <TwoPaneLayout
          style={{ flex: 1 }}
          defaultLeftWidth={generalStatus.noteListWidth}
          left={
            <NoteListNavigator
              storageId={storage.id}
              notes={sortedNotes}
              currentNoteIndex={currentNoteIndex}
              noteSorting={preferences['general.noteSorting']}
              setNoteSorting={setNoteSorting}
              createNote={createQuickNote}
              basePathname={currentPathnameWithoutNoteId}
              currentNote={currentNote}
              // TODO: Fix to show new doc animation
              lastCreatedNoteId={''}
              trashNote={trashNote}
              purgeNote={purgeNote}
            />
          }
          right={
            currentNote == null ? (
              <IdleNoteDetail />
            ) : (
              <NoteDetail
                storage={storage}
                note={currentNote}
                updateNote={updateNoteAndReport}
                addAttachments={addAttachments}
                viewMode={generalStatus.noteViewMode}
                initialCursorPosition={getCurrentPositionFromRoute()}
              />
            )
          }
          onResizeEnd={updateNoteListWidth}
        />
      </Conatiner>
    </StorageLayout>
  )
}

export default NotePage

const Conatiner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

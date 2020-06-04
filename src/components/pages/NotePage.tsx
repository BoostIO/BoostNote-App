import React, { useMemo, useCallback, useState, useEffect } from 'react'
import NoteNavigator from '../organisms/NoteNavigator'
import styled from '../../lib/styled'
import NoteDetail from '../organisms/NoteDetail'
import {
  useRouteParams,
  StorageNotesRouteParams,
  StorageTrashCanRouteParams,
  StorageTagsRouteParams,
  usePathnameWithoutNoteId,
  useRouter,
  StorageBookmarkNotes,
} from '../../lib/router'
import { useDb } from '../../lib/db'
import TwoPaneLayout from '../atoms/TwoPaneLayout'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { escapeRegExp } from '../../lib/string'
import { useTranslation } from 'react-i18next'
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

interface NotePageProps {
  storage: NoteStorage
  noteId: string | undefined
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
    | StorageBookmarkNotes
  const { noteId } = routeParams
  const { push } = useRouter()
  const { t } = useTranslation()
  const [search, setSearchInput] = useState<string>('')
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()
  const [lastCreatedNoteId, setLastCreatedNoteId] = useState<string>('')
  const { preferences, setPreferences } = usePreferences()
  const noteSorting = preferences['general.noteSorting']

  const setNoteSorting = useCallback(
    (noteSorting: NoteSortingOptions) => {
      setPreferences({
        'general.noteSorting': noteSorting,
      })
    },
    [setPreferences]
  )

  useEffect(() => {
    setLastCreatedNoteId('')
  }, [currentPathnameWithoutNoteId])

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
          if (
            (note!.folderPathname + '/').startsWith(folder.pathname + '/') &&
            !note!.trashed
          ) {
            notes.push(note)
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
  }, [storage, routeParams])

  const filteredNotes = useMemo(() => {
    let filteredNotes = notes
    if (search.trim() != '') {
      const regex = new RegExp(escapeRegExp(search), 'i')
      filteredNotes = notes.filter(
        (note) =>
          note.tags.join().match(regex) ||
          note.title.match(regex) ||
          note.content.match(regex)
      )
    }

    return sortNotesByNoteSortingOption(filteredNotes, noteSorting)
  }, [search, notes, noteSorting])

  const currentNoteIndex = useMemo(() => {
    for (let i = 0; i < filteredNotes.length; i++) {
      if (filteredNotes[i]._id === noteId) {
        return i
      }
    }
    return 0
  }, [filteredNotes, noteId])

  const currentNote: NoteDoc | undefined = useMemo(() => {
    return filteredNotes[currentNoteIndex] != null
      ? filteredNotes[currentNoteIndex]
      : undefined
  }, [filteredNotes, currentNoteIndex])

  const { generalStatus, setGeneralStatus, checkFeature } = useGeneralStatus()
  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth,
      })
    },
    [setGeneralStatus]
  )

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

    const note = await createNote(storage.id, {
      folderPathname,
      tags,
    })
    if (note == null) {
      return
    }
    setLastCreatedNoteId(note._id)

    push(
      folderPathname === '/'
        ? `/app/storages/${storage.id}/notes/${note._id}`
        : `/app/storages/${storage.id}/notes${folderPathname}/${note._id}`
    )
    dispatchNoteDetailFocusTitleInputEvent()
    checkFeature('createNote')
  }, [
    createNote,
    push,
    routeParams,
    storage.id,
    setLastCreatedNoteId,
    checkFeature,
  ])

  const showCreateNoteInList = routeParams.name === 'storages.notes'

  const { messageBox } = useDialog()
  const showPurgeNoteDialog = useCallback(
    (storageId: string, noteId: string) => {
      messageBox({
        title: t('note.delete2'),
        message: t('note.deleteMessage'),
        iconType: DialogIconTypes.Warning,
        buttons: [t('note.delete2'), t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 1,
        onClose: (value: number | null) => {
          if (value === 0) {
            purgeNote(storageId, noteId)
          }
        },
      })
    },
    [messageBox, t, purgeNote]
  )

  const navigateUp = useCallback(() => {
    if (currentNoteIndex > 0) {
      push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex - 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, push, currentPathnameWithoutNoteId])

  const navigateDown = useCallback(() => {
    if (currentNoteIndex < filteredNotes.length - 1) {
      push(
        currentPathnameWithoutNoteId +
          `/${filteredNotes[currentNoteIndex + 1]._id}`
      )
    }
  }, [filteredNotes, currentNoteIndex, push, currentPathnameWithoutNoteId])

  useGlobalKeyDownHandler((e) => {
    switch (e.key) {
      case 'n':
        if (isWithGeneralCtrlKey(e)) {
          createQuickNote()
        }
        break
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

  return (
    <TwoPaneLayout
      style={{ height: '100%' }}
      defaultLeftWidth={generalStatus.noteListWidth}
      left={
        <NoteNavigator
          search={search}
          setSearchInput={setSearchInput}
          storageId={storage.id}
          notes={filteredNotes}
          noteSorting={noteSorting}
          setNoteSorting={setNoteSorting}
          createNote={showCreateNoteInList ? createQuickNote : undefined}
          basePathname={currentPathnameWithoutNoteId}
          navigateDown={navigateDown}
          navigateUp={navigateUp}
          currentNote={currentNote}
          lastCreatedNoteId={lastCreatedNoteId}
          trashNote={trashNote}
          purgeNote={showPurgeNoteDialog}
        />
      }
      right={
        currentNote == null ? (
          <IdleNoteDetail />
        ) : (
          <NoteDetail
            storage={storage}
            currentPathnameWithoutNoteId={currentPathnameWithoutNoteId}
            note={currentNote}
            updateNote={updateNote}
            trashNote={trashNote}
            untrashNote={untrashNote}
            addAttachments={addAttachments}
            purgeNote={showPurgeNoteDialog}
            viewMode={generalStatus.noteViewMode}
            selectViewMode={selectViewMode}
            push={push}
            checkFeature={checkFeature}
          />
        )
      }
      onResizeEnd={updateNoteListWidth}
    />
  )
}

export default NotePage

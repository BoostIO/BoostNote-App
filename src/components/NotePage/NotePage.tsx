import React, { useMemo, useCallback, useState, useEffect } from 'react'
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
  useRouter,
  StorageBookmarkNotes
} from '../../lib/router'
import { useDb } from '../../lib/db'
import TwoPaneLayout from '../atoms/TwoPaneLayout'
import { PopulatedNoteDoc, NoteStorage, ObjectMap } from '../../lib/db/types'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { escapeRegExp } from '../../lib/regex'
import { useTranslation } from 'react-i18next'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey
} from '../../lib/keyboard'

export const StyledNoteDetailNoNote = styled.div`
  text-align: center;
  margin-top: 300px;
`

export type BreadCrumbs = {
  folderLabel: string
  folderPathname: string
  folderIsActive: boolean
}[]

export default () => {
  const db = useDb()

  const routeParams = useRouteParams() as (
    | StorageAllNotes
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams
    | StorageBookmarkNotes)
  const { storageId, noteId } = routeParams
  const currentStorage = useMemo(() => {
    if (storageId == null) return undefined
    return db.storageMap[storageId]
  }, [db.storageMap, storageId])
  const router = useRouter()
  const [search, setSearchInput] = useState<string>('')
  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()
  const { push } = useRouter()
  const [lastCreatedNoteId, setLastCreatedNoteId] = useState<string>('')

  const { t } = useTranslation()

  useEffect(() => {
    setLastCreatedNoteId('')
  }, [currentPathnameWithoutNoteId])

  const notes = useMemo((): PopulatedNoteDoc[] => {
    if (currentStorage == null) {
      if (routeParams.name === 'storages.allNotes') {
        const allNotesMap = (Object.values(
          db.storageMap
        ) as NoteStorage[]).reduce(
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
        return (Object.values(db.storageMap) as NoteStorage[])
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
  }, [db.storageMap, currentStorage, routeParams])

  const filteredNotes = useMemo(() => {
    if (search.trim() === '') return notes
    const regex = new RegExp(escapeRegExp(search), 'i')
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

  const currentNote: PopulatedNoteDoc | undefined = useMemo(() => {
    return filteredNotes[currentNoteIndex]
  }, [filteredNotes, currentNoteIndex])

  const createNote = useCallback(async () => {
    if (storageId == null || routeParams.name === 'storages.trashCan') {
      return
    }

    const folderIsRoot = !(routeParams.name === 'storages.notes')
    const folderPathname =
      routeParams.name === 'storages.notes' ? routeParams.folderPathname : '/'

    const tags =
      routeParams.name === 'storages.tags.show' ? [routeParams.tagName] : []

    const note = await db.createNote(storageId, {
      folderPathname,
      tags
    })
    if (note != null) {
      setLastCreatedNoteId(note._id)
      router.replace(
        `/app/storages/${storageId}/notes${folderPathname}${
          folderIsRoot ? '' : '/'
        }${note._id}`
      )
    }
  }, [db, routeParams, storageId, setLastCreatedNoteId])

  const showCreateNoteInList = routeParams.name === 'storages.notes'

  const breadCrumbs = useMemo(() => {
    if (currentNote == null || currentNote.folderPathname === '/')
      return undefined
    const folders = currentNote.folderPathname.substring(1).split('/')
    const thread = folders.map((folder, index) => {
      const folderPathname = `/${folders.slice(0, index + 1).join('/')}`
      return {
        folderLabel: folder,
        folderPathname,
        folderIsActive:
          currentPathnameWithoutNoteId ===
          `/app/storages/${storageId}/notes${folderPathname}`
      }
    })
    return thread as BreadCrumbs
  }, [currentPathnameWithoutNoteId, currentNote, storageId])

  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth
      })
    },
    [setGeneralStatus]
  )

  const toggleViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode
      })
    },
    [setGeneralStatus]
  )

  const { messageBox } = useDialog()
  const purgeNoteFromDb = db.purgeNote
  const purgeNote = useCallback(
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
            purgeNoteFromDb(storageId, noteId)
          }
        }
      })
    },
    [messageBox, purgeNoteFromDb]
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

  useGlobalKeyDownHandler(e => {
    switch (e.key) {
      case 'Backspace':
        if (storageId != null && e.shiftKey && isWithGeneralCtrlKey(e)) {
          db.trashNote(storageId, currentNote._id)
        }
        break
      case 'Enter':
        if (isWithGeneralCtrlKey(e)) {
          createNote()
        }
        break
      case 's':
        if (isWithGeneralCtrlKey(e) && e.altKey) {
          toggleViewMode('split')
        }
        break
      case 'e':
        if (isWithGeneralCtrlKey(e) && e.altKey) {
          toggleViewMode('edit')
        }
        break
      case 'p':
        if (isWithGeneralCtrlKey(e) && e.altKey) {
          toggleViewMode('preview')
        }
        break
    }
  })

  return (
    <TwoPaneLayout
      style={{ height: '100%' }}
      defaultLeftWidth={generalStatus.noteListWidth}
      left={
        <NoteList
          search={search}
          setSearchInput={setSearchInput}
          currentStorageId={storageId}
          notes={filteredNotes}
          createNote={showCreateNoteInList ? createNote : undefined}
          basePathname={currentPathnameWithoutNoteId}
          navigateDown={navigateDown}
          navigateUp={navigateUp}
          currentNoteId={currentNote ? currentNote._id : undefined}
          lastCreatedNoteId={lastCreatedNoteId}
        />
      }
      right={
        currentNote == null ? (
          <StyledNoteDetailNoNote>
            {storageId != null ? (
              <div>
                <h1>{t('note.createKeyMac')}</h1>
                <h1>{t('note.createKeyWinLin')}</h1>
                <h2>{t('note.createkeymessage1')}</h2>
              </div>
            ) : (
              <div>
                <h1>{t('note.createkeymessage2')}</h1>
                <h2>{t('note.createkeymessage3')}</h2>
              </div>
            )}
          </StyledNoteDetailNoNote>
        ) : (
          <NoteDetail
            noteStorageName={db.storageMap[currentNote.storageId]!.name}
            currentPathnameWithoutNoteId={currentPathnameWithoutNoteId}
            note={currentNote}
            updateNote={db.updateNote}
            trashNote={db.trashNote}
            untrashNote={db.untrashNote}
            addAttachments={db.addAttachments}
            purgeNote={purgeNote}
            viewMode={generalStatus.noteViewMode}
            toggleViewMode={toggleViewMode}
            push={push}
            breadCrumbs={breadCrumbs}
          />
        )
      }
      onResizeEnd={updateNoteListWidth}
    />
  )
}

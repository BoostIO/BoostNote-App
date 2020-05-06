import React, { useMemo, useCallback, useState, useEffect } from 'react'
import NoteList from '../organisms/NoteList'
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
import Image from '../atoms/Image'
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

export const StyledNoteDetailNoNote = styled.div`
  text-align: center;
  margin-top: 11%;
  color: #a9a9a9;

  img {
    max-width: 100%;
    height: auto;
  }

  section {
    margin: auto;
    display: flex;
    width: 50%;
    text-align: center;

    div {
      text-align: center;
      margin: 0 auto;
      display: block;
    }
  }

  // Keybinds
  h2 {
    font-weight: normal;

    // Keybind Buttons
    span {
      margin: 5px auto;
      padding: 5px 10px;
      width: max-content;
      background: #333;
      border-radius: 8px;
      box-shadow: 0 5px #242424;
    }
  }
  h3 {
    margin: 20px auto;
    font-weight: normal;
  }
  h4 {
    margin: 0;
    font-weight: normal;
  }
`

export type BreadCrumbs = {
  folderLabel: string
  folderPathname: string
  folderIsActive: boolean
}[]

export type NoteListSortOptions = 'createdAt' | 'title' | 'updatedAt'

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
  const [sort, setSort] = useState<NoteListSortOptions>('updatedAt')

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
        return (Object.values(storage.noteMap) as NoteDoc[]).filter(
          (note) => note.trashed
        )
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
    return filteredNotes.sort((first, second) => {
      return sort === 'title'
        ? first[sort].localeCompare(second[sort])
        : second[sort].localeCompare(first[sort])
    })
  }, [search, notes, sort])

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

  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth,
      })
    },
    [setGeneralStatus]
  )

  const toggleViewMode = useCallback(
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
    if (note != null) {
      console.log(`/app/storages/${storage.id}/notes${folderPathname}
        ${note._id}`)
      setLastCreatedNoteId(note._id)
      push(`/app/storages/${storage.id}/notes${folderPathname}${note._id}`)
      dispatchNoteDetailFocusTitleInputEvent()
    }
  }, [createNote, push, routeParams, storage.id, setLastCreatedNoteId])

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
          `/app/storages/${storage.id}/notes${folderPathname}`,
      }
    })
    return thread as BreadCrumbs
  }, [currentPathnameWithoutNoteId, currentNote, storage.id])

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

  const trashOrPurgeCurrentNote = useCallback(() => {
    if (currentNote == null) {
      return
    }

    if (!currentNote.trashed) {
      trashNote(storage.id, currentNote._id)
    } else {
      purgeNote(storage.id, currentNote._id)
    }
  }, [trashNote, purgeNote, currentNote, storage.id])

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
              toggleViewMode('split')
              break
            case 'split':
              toggleViewMode('preview')
              break
            default:
              toggleViewMode('edit')
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
        <NoteList
          search={search}
          setSearchInput={setSearchInput}
          storageId={storage.id}
          notes={filteredNotes}
          createNote={showCreateNoteInList ? createQuickNote : undefined}
          basePathname={currentPathnameWithoutNoteId}
          navigateDown={navigateDown}
          navigateUp={navigateUp}
          currentNoteId={currentNote ? currentNote._id : undefined}
          lastCreatedNoteId={lastCreatedNoteId}
          setSort={setSort}
          trashOrPurgeCurrentNote={trashOrPurgeCurrentNote}
        />
      }
      right={
        currentNote == null ? (
          <StyledNoteDetailNoNote>
            <Image src={'/app/static/logo_index.svg'} />
            <h3>{t('note.createkeymessage1')}</h3>
            {/* Might need to be changed if custom keybinds is implemented */}
            <section>
              <div>
                {/* 'note.createKey' differs in locales: N/Enter */}
                <h2>
                  <span>Ctrl</span> + <span>{t('note.createKey')}</span>
                </h2>
                <h4>{t('note.createKeyWinLin')}</h4>
              </div>
              <h3>{t('note.createKeyOr')}</h3>
              <div>
                <h2>
                  <span>⌘</span> + <span>{t('note.createKey')}</span>
                </h2>
                <h4>{t('note.createKeyMac')}</h4>
              </div>
            </section>
          </StyledNoteDetailNoNote>
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

export default NotePage

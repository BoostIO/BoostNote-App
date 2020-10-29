import React, { useCallback, useRef } from 'react'
import NoteItem from '../molecules/NoteItem'
import styled from '../../lib/styled'
import { borderBottom } from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import { isWithGeneralCtrlKey } from '../../lib/keyboard'
import { osName } from '../../lib/platform'
import { NoteDoc } from '../../lib/db/types'
import { NoteSortingOptions } from '../../lib/sort'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'
import { usePreferences } from '../../lib/preferences'
import { useRouter } from '../../lib/router'
import { usePathnameWithoutNoteId } from '../../lib/routeParams'
import { MenuItemConstructorOptions } from 'electron'
import { openContextMenu } from '../../lib/electronOnly'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  outline: none;
`

const EmptyItem = styled.li`
  user-select: none;
  padding: 10px;
  color: ${({ theme }) => theme.noteNavEmptyItemColor};
`

const NoteListControl = styled.div`
  height: 25px;
  display: flex;
  ${borderBottom};
`

const NoteSortingSelect = styled.select`
  border: none;
  flex: 1;
  color: ${({ theme }) => theme.uiTextColor};
  background-color: ${({ theme }) => theme.backgroundColor};
`

const NoteList = styled.ul`
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
`

type NoteListNavigatorProps = {
  storageId: string
  currentNote?: NoteDoc
  currentNoteIndex: number
  notes: NoteDoc[]
  noteSorting: NoteSortingOptions
  setNoteSorting: (noteSorting: NoteSortingOptions) => void
  createNote?: () => Promise<void>
  basePathname: string
  lastCreatedNoteId: string
  trashNote: (storageId: string, noteId: string) => Promise<NoteDoc | undefined>
  purgeNote: (storageId: string, noteId: string) => void
}

const NoteListNavigator = ({
  currentNote,
  currentNoteIndex,
  notes,
  noteSorting,
  setNoteSorting,
  createNote,
  storageId,
  basePathname,
  trashNote,
  purgeNote,
  lastCreatedNoteId,
}: NoteListNavigatorProps) => {
  const { preferences, setPreferences } = usePreferences()
  const { t } = useTranslation()

  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()
  const noteListView = preferences['general.noteListView']

  const applyDefaultNoteListing = useCallback(() => {
    setPreferences({ ['general.noteListView']: 'default' })
  }, [setPreferences])

  const applyCompactListing = useCallback(() => {
    setPreferences({ ['general.noteListView']: 'compact' })
  }, [setPreferences])

  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const focusList = useCallback(() => {
    listRef.current!.focus()
  }, [])

  const { push } = useRouter()
  const navigateUp = useCallback(() => {
    if (currentNoteIndex > 0) {
      push(currentPathnameWithoutNoteId + `/${notes[currentNoteIndex - 1]._id}`)
    }
  }, [notes, currentNoteIndex, push, currentPathnameWithoutNoteId])

  const navigateDown = useCallback(() => {
    if (currentNoteIndex < notes.length - 1) {
      push(currentPathnameWithoutNoteId + `/${notes[currentNoteIndex + 1]._id}`)
    }
  }, [notes, currentNoteIndex, push, currentPathnameWithoutNoteId])

  const trashOrPurgeCurrentNote = useCallback(() => {
    if (currentNote == null) {
      return
    }

    if (!currentNote.trashed) {
      trashNote(storageId, currentNote._id)
    } else {
      purgeNote(storageId, currentNote._id)
    }
    focusList()
  }, [trashNote, purgeNote, currentNote, storageId, focusList])

  const handleListKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      switch (event.key) {
        case 'Delete':
          if (osName !== 'macos') {
            trashOrPurgeCurrentNote()
          }
          break
        case 'Backspace':
          if (isWithGeneralCtrlKey(event)) {
            trashOrPurgeCurrentNote()
          }
          break
        case 's':
          searchRef.current!.focus()
          break
        case 'j':
          navigateDown()
          break
        case 'k':
          navigateUp()
          break
      }
    },
    [trashOrPurgeCurrentNote, navigateDown, navigateUp]
  )

  const openListContextMenu: React.MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault()

      const menuItems: MenuItemConstructorOptions[] = [
        {
          type: 'normal',
          label: 'Default View',
          click: applyDefaultNoteListing,
        },
        {
          type: 'normal',
          label: 'Compact View',
          click: applyCompactListing,
        },
      ]

      if (createNote != null) {
        menuItems.unshift(
          {
            type: 'normal',
            label: 'New Note',
            click: createNote,
          },
          {
            type: 'separator',
          }
        )
      }

      openContextMenu({ menuItems })
    },
    [createNote, applyDefaultNoteListing, applyCompactListing]
  )

  return (
    <Container>
      <NoteListControl>
        <NoteSortingSelect
          value={noteSorting}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            setNoteSorting(event.target.value as NoteSortingOptions)
          }}
        >
          <NoteSortingOptionsFragment />
        </NoteSortingSelect>
      </NoteListControl>
      <NoteList
        tabIndex={0}
        ref={listRef}
        onKeyDown={handleListKeyDown}
        onContextMenu={openListContextMenu}
      >
        {notes.map((note) => {
          const noteIsCurrentNote = note._id === currentNote?._id

          return (
            <li key={note._id}>
              <NoteItem
                storageId={storageId}
                active={noteIsCurrentNote}
                note={note}
                basePathname={basePathname}
                focusList={focusList}
                recentlyCreated={lastCreatedNoteId === note._id}
                noteListView={noteListView}
                applyDefaultNoteListing={applyDefaultNoteListing}
                applyCompactListing={applyCompactListing}
              />
            </li>
          )
        })}
        {notes.length === 0 && <EmptyItem>{t('note.nothing')}</EmptyItem>}
      </NoteList>
    </Container>
  )
}

export default NoteListNavigator

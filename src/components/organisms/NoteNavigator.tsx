import React, { useCallback, useRef } from 'react'
import NoteItem from '../molecules/NoteItem'
import styled from '../../lib/styled'
import {
  borderBottom,
  noteListIconColor,
  flexCenter,
} from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import { isWithGeneralCtrlKey } from '../../lib/keyboard'
import { osName } from '../../lib/platform'
import Icon from '../atoms/Icon'
import { mdiPlus, mdiMagnify, mdiClose } from '@mdi/js'
import { NoteDoc } from '../../lib/db/types'
import { NoteSortingOptions } from '../../lib/sort'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'
import { usePreferences } from '../../lib/preferences'
import { useContextMenu, MenuTypes, MenuItem } from '../../lib/contextMenu'

const NoteNavigatorContainer = styled.div`
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

const Toolbar = styled.div`
  height: 40px;
  display: flex;
  padding: 0 0 0 8px;
  align-items: center;
  -webkit-app-region: drag;
  ${borderBottom}
  .newNoteButton {
    width: 36px;
    height: 36px;
    font-size: 18px;
    background-color: transparent;
    border-radius: 50%;
    border: none;
    cursor: pointer;

    transition: color 200ms ease-in-out;
    ${flexCenter}

    color: ${({ theme }) => theme.navButtonColor};
    &:hover {
      color: ${({ theme }) => theme.navButtonHoverColor};
    }

    &:active,
    .active {
      color: ${({ theme }) => theme.navButtonActiveColor};
    }
  }

  .clearButton {
    position: absolute;
    right: 0;
    top: 0;
    width: 30px;
    height: 30px;
    font-size: 18px;
    background-color: transparent;
    border-radius: 50%;
    border: none;
    cursor: pointer;

    transition: color 200ms ease-in-out;
    ${flexCenter}

    color: ${({ theme }) => theme.navButtonColor};
    &:hover {
      color: ${({ theme }) => theme.navButtonHoverColor};
    }

    &:active,
    .active {
      color: ${({ theme }) => theme.navButtonActiveColor};
    }
  }
`

const Search = styled.div`
  background-color: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  color: ${({ theme }) => theme.textColor};
  flex: 1;
  position: relative;
  height: 32px;
  color: ${({ theme }) => theme.navButtonColor};
  border-radius: 4px;
  overflow: hidden;
  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor};
  }
  .icon {
    position: absolute;
    top: 6px;
    left: 10px;
    font-size: 18px;
    z-index: 0;
    pointer-events: none;
    ${noteListIconColor}
  }
  .input {
    background-color: transparent;
    position: relative;
    color: ${({ theme }) => theme.uiTextColor};
    width: 100%;
    height: 30px;
    padding-left: 35px;
    box-sizing: border-box;
    border: none;
    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor};
    }
    &::placeholder {
      color: ${({ theme }) => theme.uiTextColor};
    }
  }
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

type NoteNavigatorProps = {
  storageId: string
  currentNote?: NoteDoc
  search: string
  notes: NoteDoc[]
  noteSorting: NoteSortingOptions
  setNoteSorting: (noteSorting: NoteSortingOptions) => void
  createNote?: () => Promise<void>
  setSearchInput: (input: string) => void
  navigateDown: () => void
  navigateUp: () => void
  basePathname: string
  lastCreatedNoteId: string
  trashNote: (storageId: string, noteId: string) => Promise<NoteDoc | undefined>
  purgeNote: (storageId: string, noteId: string) => void
}

const NoteNavigator = ({
  currentNote,
  notes,
  noteSorting,
  setNoteSorting,
  createNote,
  storageId,
  basePathname,
  search,
  setSearchInput,
  navigateDown,
  navigateUp,
  lastCreatedNoteId,
  trashNote,
  purgeNote,
}: NoteNavigatorProps) => {
  const { preferences, setPreferences } = usePreferences()
  const { t } = useTranslation()
  const { popup } = useContextMenu()

  const noteListView = preferences['general.noteListView']

  const applyDefaultNoteListing = useCallback(() => {
    setPreferences({ ['general.noteListView']: 'default' })
  }, [setPreferences])

  const applyCompactListing = useCallback(() => {
    setPreferences({ ['general.noteListView']: 'compact' })
  }, [setPreferences])

  const updateSearchInput: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setSearchInput(event.target.value)
    },
    [setSearchInput]
  )

  const clearSearchInput = useCallback(() => {
    setSearchInput('')
  }, [setSearchInput])

  const handleSearchInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      switch (event.key) {
        case 'Escape':
          clearSearchInput()
          break
      }
    },
    [clearSearchInput]
  )

  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const focusList = useCallback(() => {
    listRef.current!.focus()
  }, [])

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

      const menuItems: MenuItem[] = [
        {
          type: MenuTypes.Normal,
          label: 'Default View',
          onClick: applyDefaultNoteListing,
        },
        {
          type: MenuTypes.Normal,
          label: 'Compact View',
          onClick: applyCompactListing,
        },
      ]

      if (createNote != null) {
        menuItems.unshift(
          {
            type: MenuTypes.Normal,
            label: 'New Note',
            onClick: createNote,
          },
          {
            type: MenuTypes.Separator,
          }
        )
      }

      popup(event, menuItems)
    },
    [createNote, popup, applyDefaultNoteListing, applyCompactListing]
  )

  return (
    <NoteNavigatorContainer>
      <Toolbar>
        <Search>
          <input
            ref={searchRef}
            className='input'
            value={search}
            onChange={updateSearchInput}
            onKeyDown={handleSearchInputKeyDown}
            placeholder={t('note.search')}
          />
          <Icon className='icon' path={mdiMagnify} />
          {search.length > 0 && (
            <button className='clearButton' onClick={clearSearchInput}>
              <Icon path={mdiClose} />
            </button>
          )}
        </Search>
        {storageId != null && createNote != null && (
          <button className='newNoteButton' onClick={createNote}>
            <Icon className='icon' path={mdiPlus} />
          </button>
        )}
      </Toolbar>
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
                search={search}
                recentlyCreated={lastCreatedNoteId === note._id}
                noteListView={noteListView}
                applyDefaultNoteListing={applyDefaultNoteListing}
                applyCompactListing={applyCompactListing}
              />
            </li>
          )
        })}
        {notes.length === 0 ? (
          search.trim() === '' ? (
            <EmptyItem>{t('note.nothing')}</EmptyItem>
          ) : (
            <EmptyItem>{t('note.nothingMessage')}</EmptyItem>
          )
        ) : null}
      </NoteList>
    </NoteNavigatorContainer>
  )
}

export default NoteNavigator

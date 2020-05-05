import React, {
  useCallback,
  useRef,
  ChangeEventHandler,
  ChangeEvent,
} from 'react'
import NoteItem from '../molecules/NoteItem'
import styled from '../../lib/styled'
import {
  borderBottom,
  noteListIconColor,
  flexCenter,
} from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey,
} from '../../lib/keyboard'
import { osName } from '../../lib/platform'
import Icon from '../atoms/Icon'
import { mdiPlus, mdiMagnify } from '@mdi/js'
import { NoteDoc } from '../../lib/db/types'
import { NoteSortingOptions } from '../../lib/sort'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'

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
  height: 50px;
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

type NoteNavigatorprops = {
  storageId: string
  currentNoteId?: string
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
  trashOrPurgeCurrentNote: () => void
}

const NoteNavigator = ({
  notes,
  noteSorting,
  setNoteSorting,
  createNote,
  storageId,
  basePathname,
  search,
  currentNoteId,
  setSearchInput,
  navigateDown,
  navigateUp,
  lastCreatedNoteId,
  trashOrPurgeCurrentNote,
}: NoteNavigatorprops) => {
  const { t } = useTranslation()
  const updateSearchInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setSearchInput(event.target.value)
    },
    [setSearchInput]
  )

  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useGlobalKeyDownHandler((e) => {
    switch (e.key) {
      case 's':
        if (isWithGeneralCtrlKey(e) && !e.shiftKey) {
          searchRef.current!.focus()
        }
        break
      case 'j':
        if (isWithGeneralCtrlKey(e)) {
          e.preventDefault()
          e.stopPropagation()
          navigateDown()
        }
        break
      case 'k':
        if (isWithGeneralCtrlKey(e)) {
          e.preventDefault()
          e.stopPropagation()
          navigateUp()
        }
        break
      default:
        break
    }
  })

  const focusList = useCallback(() => {
    listRef.current!.focus()
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
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
      }
    },
    [trashOrPurgeCurrentNote]
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
            placeholder={t('note.search')}
          />
          <Icon className='icon' path={mdiMagnify} />
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
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setNoteSorting(event.target.value as NoteSortingOptions)
          }}
        >
          <NoteSortingOptionsFragment />
        </NoteSortingSelect>
      </NoteListControl>
      <NoteList tabIndex={0} ref={listRef} onKeyDown={handleListKeyDown}>
        {notes.map((note) => {
          const noteIsCurrentNote = note._id === currentNoteId
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

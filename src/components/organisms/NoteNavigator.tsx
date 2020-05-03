import React, { useCallback, useRef, ChangeEventHandler } from 'react'
import NoteItem from '../molecules/NoteItem'
import styled from '../../lib/styled'
import {
  borderBottom,
  noteListIconColor,
  selectTabStyle,
  disabledUiTextColor,
  inputStyle,
} from '../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey,
} from '../../lib/keyboard'
import { NoteListSortOptions } from '../pages/NotePage'
import { osName } from '../../lib/platform'
import Icon from '../atoms/Icon'
import { mdiChevronDown, mdiPlus, mdiMagnify } from '@mdi/js'
import { NoteDoc } from '../../lib/db/types'

const NoteNavigatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  outline: none;
  & > ul {
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
  }

  .filterTab {
    height: 25px;
    display: flex;
    align-items: center;
    padding-left: 1em;
    .filterIcon {
      font-size: 10px;
      margin-right: 5px;
      z-index: 0;
      pointer-events: none;

      transition: color 200ms ease-in-out;
      color: ${({ theme }) => theme.navButtonColor};
      &:hover {
        color: ${({ theme }) => theme.navButtonHoverColor};
      }

      &:active,
      .active {
        color: ${({ theme }) => theme.navButtonActiveColor};
      }
    }
    .input {
      ${selectTabStyle}
    }
    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      border: none;
      background: transparent;
    }
    ${borderBottom};
    ${noteListIconColor};
  }
  .empty {
    user-select: none;
    padding: 10px;
    ${disabledUiTextColor};
  }
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
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: transparent;
    border-radius: 50%;
    border: none;
    cursor: pointer;

    transition: color 200ms ease-in-out;
    color: ${({ theme }) => theme.navButtonColor};
    &:hover {
      color: ${({ theme }) => theme.navButtonHoverColor};
    }

    &:active,
    .active {
      color: ${({ theme }) => theme.navButtonActiveColor};
    }
  }

  .searchInput {
    ${inputStyle}
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
    }
  }
`

type NoteNavigatorprops = {
  storageId: string
  currentNoteId?: string
  search: string
  notes: NoteDoc[]
  createNote?: () => Promise<void>
  setSearchInput: (input: string) => void
  navigateDown: () => void
  navigateUp: () => void
  basePathname: string
  lastCreatedNoteId: string
  setSort: (option: NoteListSortOptions) => void
  trashOrPurgeCurrentNote: () => void
}

const NoteNavigator = ({
  notes,
  createNote,
  storageId,
  basePathname,
  search,
  currentNoteId,
  setSearchInput,
  navigateDown,
  navigateUp,
  lastCreatedNoteId,
  setSort,
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
        <div className='searchInput'>
          <input
            ref={searchRef}
            className='input'
            value={search}
            onChange={updateSearchInput}
            placeholder={t('note.search')}
          />
          <Icon className='icon' path={mdiMagnify} />
        </div>
        {storageId != null && createNote != null && (
          <button className='newNoteButton' onClick={createNote}>
            <Icon className='icon' path={mdiPlus} />
          </button>
        )}
      </Toolbar>
      <div className='filterTab'>
        <Icon path={mdiChevronDown} />
        <select
          className='input'
          onChange={(e) => setSort(e.target.value as NoteListSortOptions)}
        >
          <option value='updatedAt'>Updated</option>
          <option value='createdAt'>Created</option>
          <option value='title'>Title</option>
        </select>
      </div>
      <ul tabIndex={0} ref={listRef} onKeyDown={handleListKeyDown}>
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
            <li className='empty'>{t('note.nothing')}</li>
          ) : (
            <li className='empty'>{t('note.nothingMessage')}</li>
          )
        ) : null}
      </ul>
    </NoteNavigatorContainer>
  )
}

export default NoteNavigator

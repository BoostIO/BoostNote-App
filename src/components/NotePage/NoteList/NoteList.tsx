import React, { useCallback, useRef, ChangeEventHandler } from 'react'
import NoteItem from './NoteItem'
import { PopulatedNoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import {
  borderBottom,
  inputStyle,
  iconColor,
  noteListIconColor,
  selectTabStyle
} from '../../../lib/styled/styleFunctions'
import { IconEdit, IconLoupe, IconArrowSingleDown } from '../../icons'
import { useTranslation } from 'react-i18next'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey
} from '../../../lib/keyboard'
import { NoteListSortOptions } from '../NotePage'
import { osName } from '../../../lib/utils'

export const StyledNoteListContainer = styled.div`
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

  .control {
    height: 50px;
    display: flex;
    padding: 8px;
    align-items: center;
    -webkit-app-region: drag;
    ${borderBottom}
  }

  .searchInput {
    flex: 1;
    position: relative;
    height: 32px;
    .icon {
      position: absolute;
      top: 8px;
      left: 10px;
      font-size: 20px;
      z-index: 0;
      pointer-events: none;
      ${noteListIconColor}
    }
    .input {
      position: relative;
      width: 100%;
      height: 32px;
      padding-left: 35px;
      box-sizing: border-box;
      ${inputStyle}
    }
    select {
      appearance: none;
    }
  }

  .filterTab {
    height: 25px;
    display: flex;
    align-items: center;
    padding-left: 13px;
    .filterIcon {
      font-size: 10px;
      margin-right: 5px;
      z-index: 0;
      pointer-events: none;
      ${iconColor}
    }
    .input {
      ${selectTabStyle}
    }
    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  }

  .newNoteButton {
    width: 35px;
    height: 30px;
    font-size: 24px;
    background: transparent;
    border: none;
    ${noteListIconColor}
  }
`

type NoteListProps = {
  currentStorageId?: string
  currentNoteId?: string
  search: string
  notes: PopulatedNoteDoc[]
  createNote?: () => Promise<void>
  setSearchInput: (input: string) => void
  navigateDown: () => void
  navigateUp: () => void
  basePathname: string
  lastCreatedNoteId: string
  setSort: (option: NoteListSortOptions) => void
  trashOrPurgeCurrentNote: () => void
}

const NoteList = ({
  notes,
  createNote,
  currentStorageId,
  basePathname,
  search,
  currentNoteId,
  setSearchInput,
  navigateDown,
  navigateUp,
  lastCreatedNoteId,
  setSort,
  trashOrPurgeCurrentNote
}: NoteListProps) => {
  const { t } = useTranslation()
  const updateSearchInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setSearchInput(event.target.value)
    },
    [setSearchInput]
  )

  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useGlobalKeyDownHandler(e => {
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
    <StyledNoteListContainer>
      <div className='control'>
        <div className='searchInput'>
          <input
            ref={searchRef}
            className='input'
            value={search}
            onChange={updateSearchInput}
            placeholder={t('note.search')}
          />
          <IconLoupe className='icon' size='0.8em' />
        </div>
        {currentStorageId != null && createNote != null && (
          <button className='newNoteButton' onClick={createNote}>
            <IconEdit size='0.8em' />
          </button>
        )}
      </div>
      <div className='filterTab'>
        <IconArrowSingleDown className='filterIcon' size='0.8em' />
        <select
          className='input'
          onChange={e => setSort(e.target.value as NoteListSortOptions)}
        >
          <option value='updatedAt'>Updated</option>
          <option value='createdAt'>Created</option>
          <option value='title'>Title</option>
        </select>
      </div>
      <ul tabIndex={0} ref={listRef} onKeyDown={handleListKeyDown}>
        {notes.map(note => {
          const noteIsCurrentNote = note._id === currentNoteId
          return (
            <li key={note._id}>
              <NoteItem
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
    </StyledNoteListContainer>
  )
}

export default NoteList

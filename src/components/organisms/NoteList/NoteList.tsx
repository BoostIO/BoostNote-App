import React, { useCallback, useRef, ChangeEventHandler, useState } from 'react'
import NoteItem from './NoteItem'
import { PopulatedNoteDoc } from '../../../lib/db/types'
import styled from '../../../lib/styled'
import {
  borderBottom,
  inputStyle,
  iconColor,
  noteListIconColor,
  selectTabStyle,
} from '../../../lib/styled/styleFunctions'
import { IconEdit, IconLoupe, IconArrowSingleDown } from '../../icons'
import { useTranslation } from 'react-i18next'
import {
  useGlobalKeyDownHandler,
  isWithGeneralCtrlKey,
} from '../../../lib/keyboard'
import { NoteListSortOptions } from '../../pages/NotePage'
import { osName } from '../../../lib/platform'

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
  .list-button{
    width: 25px;
    padding: 0;
    background-color: transparent;
    border: none;
    color: rgba(255,255,255,0.3);
    transition: 0.15s;
    &:active, &:active:hover;
      color: $ui-inactive-text-color;
    &:hover
      color: $ui-inactive-text-color;
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
  trashOrPurgeCurrentNote,
}: NoteListProps) => {

  const [liststyle, setListStyle] = useState(false);
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

  function enableDetailView(){
    setListStyle(true);
  }

  function disableDetailView(){
    setListStyle(false);
  }

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
          onChange={(e) => setSort(e.target.value as NoteListSortOptions)}
        >
          <option value='updatedAt'>Updated</option>
          <option value='createdAt'>Created</option>
          <option value='title'>Title</option>
        </select>
        <button
              title={'Default View'}
              className={'list-button'}
              onClick={enableDetailView}
            >
              <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>icon-column</title><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard" transform="translate(-440.000000, -198.000000)"><g id="icon-column" transform="translate(436.000000, 194.000000)"><rect id="Rectangle-7" fill="#D8D8D8" opacity="0" x="0" y="0" width="20" height="20"></rect><g id="server" transform="translate(5.000000, 5.000000)" stroke="#8A8C8D" stroke-linecap="round" stroke-linejoin="round"><rect id="Rectangle-path" x="0" y="0" width="10" height="4" rx="1"></rect><rect id="Rectangle-path" x="0" y="6" width="10" height="4" rx="1"></rect></g></g></g></g></svg>
            </button>

        <button
              title={'Default View'}
              className={'list-button'}
              onClick={disableDetailView}
            >
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="13px" height="13px"><path d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"/></svg>
              
        </button>
      </div>
      <ul tabIndex={0} ref={listRef} onKeyDown={handleListKeyDown}>
        {notes.map((note) => {
          const noteIsCurrentNote = note._id === currentNoteId
          return (
            <li key={note._id}>
              <NoteItem
                active={noteIsCurrentNote}
                note={note}
                basePathname={basePathname}
                focusList={focusList}
                search={search}
                liststyle={liststyle}
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

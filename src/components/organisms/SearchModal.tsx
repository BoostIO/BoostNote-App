import React, {
  useState,
  ChangeEventHandler,
  useCallback,
  useRef,
  KeyboardEvent,
} from 'react'
import styled from '../../lib/styled'
import { NoteStorage, NoteDoc } from '../../lib/db/types'
import { useEffectOnce, useDebounce } from 'react-use'
import { values } from '../../lib/db/utils'
import { escapeRegExp } from '../../lib/string'
import { useSearchModal } from '../../lib/searchModal'
import { border, borderBottom } from '../../lib/styled/styleFunctions'
import { mdiMagnify } from '@mdi/js'
import Icon from '../atoms/Icon'
import SearchModalNoteResultItem from '../molecules/SearchModalNoteResultItem'
import { useStorageRouter } from '../../lib/storageRouter'

interface SearchModalProps {
  storage: NoteStorage
}

const SearchModal = ({ storage }: SearchModalProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [resultList, setResultList] = useState<NoteDoc[]>([])
  const [searching, setSearching] = useState(false)
  const { toggleShowSearchModal } = useSearchModal()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const updateSearchValue: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setSearchValue(event.target.value)
      setSearching(true)
    },
    []
  )

  const focusInput = useCallback(() => {
    if (searchInputRef.current == null) {
      return
    }
    searchInputRef.current.focus()
  }, [])

  useEffectOnce(() => {
    focusInput()
  })

  useDebounce(
    () => {
      if (searchValue.trim() === '') {
        setResultList([])
        setSearching(false)
        return
      }
      const notes = values(storage.noteMap)
      const regex = new RegExp(escapeRegExp(searchValue), 'i')
      const filteredNotes = notes.filter(
        (note) =>
          !note.trashed &&
          (note.tags.join().match(regex) ||
            note.title.match(regex) ||
            note.content.match(regex))
      )
      setResultList(filteredNotes)
      setSearching(false)
    },
    200,
    [storage.noteMap, searchValue]
  )

  const { navigateToNote: _navigateToNote } = useStorageRouter()

  const navigateToNote = useCallback(
    (noteId: string) => {
      toggleShowSearchModal()
      _navigateToNote(storage.id, noteId)
    },
    [storage.id, _navigateToNote, toggleShowSearchModal]
  )

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      console.log(event.key)
      if (event.key === 'Escape') {
        // TODO: Focus back after modal closed
        toggleShowSearchModal()
      }
    },
    [toggleShowSearchModal]
  )

  return (
    <Container>
      <div className='container' onClick={focusInput}>
        <div className='search'>
          <Icon path={mdiMagnify} />
          <input
            onKeyDown={handleSearchInputKeyDown}
            value={searchValue}
            onChange={updateSearchValue}
            ref={searchInputRef}
          />
        </div>
        <div className='list'>
          {searching && <div className='searching'>Searching ...</div>}
          {!searching && resultList.length === 0 && (
            <div className='empty'>No Results</div>
          )}
          {!searching &&
            resultList.map((result) => {
              return (
                <SearchModalNoteResultItem
                  key={result._id}
                  note={result}
                  navigateToNote={navigateToNote}
                />
              )
            })}
        </div>
      </div>
      <div className='shadow' onClick={toggleShowSearchModal} />
    </Container>
  )
}

export default SearchModal

const Container = styled.div`
  z-index: 6000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  -webkit-app-region: drag;

  & > .container {
    position: relative;
    margin: 50px auto 0;
    background-color: ${({ theme }) => theme.navBackgroundColor};
    width: 400px;
    z-index: 6002;
    ${border}
    border-radius: 10px;
    max-height: 360px;
    display: flex;
    flex-direction: column;
    & > .search {
      padding: 10px;
      display: flex;
      align-items: center;
      ${borderBottom};
      input {
        flex: 1;
        background-color: transparent;
        border: none;
        color: ${({ theme }) => theme.uiTextColor};
      }
    }
    & > .list {
      flex: 1;
      overflow-x: hidden;
      overflow-y: auto;
      & > .searching {
        text-align: center;
        color: ${({ theme }) => theme.disabledUiTextColor};
        padding: 10px;
      }
      & > .empty {
        text-align: center;
        color: ${({ theme }) => theme.disabledUiTextColor};
        padding: 10px;
      }
      & > .item {
      }
    }
  }
  & > .shadow {
    position: absolute;
    z-index: 6001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }
`

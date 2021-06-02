import React, {
  useState,
  ChangeEventHandler,
  useCallback,
  useRef,
  KeyboardEvent,
} from 'react'
import { NoteDoc, NoteStorage } from '../../lib/db/types'
import { useEffectOnce, useDebounce } from 'react-use'
import { excludeNoteIdPrefix } from '../../lib/db/utils'
import { useSearchModal } from '../../lib/searchModal'
import { flexCenter, textOverflow } from '../../lib/styled/styleFunctions'
import { mdiMagnify, mdiClose, mdiCardTextOutline } from '@mdi/js'
import SearchModalNoteResultItem from '../molecules/SearchModalNoteResultItem'
import { useStorageRouter } from '../../lib/storageRouter'
import {
  getSearchResultKey,
  NoteSearchData,
  SearchResult,
  SEARCH_DEBOUNCE_TIMEOUT,
  GLOBAL_MERGE_SAME_LINE_RESULTS_INTO_ONE,
} from '../../lib/search/search'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CodeMirror from 'codemirror'
import cc from 'classcat'
import styled from '../../shared/lib/styled'
import { BaseTheme } from '../../shared/lib/styled/types'
import {
  border,
  borderBottom,
  borderTop,
} from '../../shared/lib/styled/styleFunctions'
import {
  getSearchResultItems,
  getSearchRegex,
} from '../../lib/v2/mappers/local/searchResults'
import Icon from '../../shared/components/atoms/Icon'

interface SearchModalProps {
  storage: NoteStorage
}

const SearchModal = ({ storage }: SearchModalProps) => {
  const [noteToSearchResultMap] = useState({})
  const [selectedNote, setSelectedNote] = useState<NoteDoc | null>(null)
  const [selectedItemId, setSelectedItemId] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [resultList, setResultList] = useState<NoteSearchData[]>([])
  const [searching, setSearching] = useState(false)
  const { toggleShowSearchModal } = useSearchModal()
  const searchTextAreaRef = useRef<HTMLTextAreaElement>(null)

  const updateSearchValue: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setSearchValue(event.target.value)
      setSearching(true)
    },
    []
  )

  const focusTextAreaInput = useCallback(() => {
    if (searchTextAreaRef.current == null) {
      return
    }
    searchTextAreaRef.current.focus()
  }, [])

  useEffectOnce(() => {
    focusTextAreaInput()
  })

  const { navigateToNoteWithEditorFocus: _navFocusEditor } = useStorageRouter()

  const navFocusEditor = useCallback(
    (noteId: string, lineNum: number, lineColumn = 0) => {
      toggleShowSearchModal()
      _navFocusEditor(storage.id, noteId, '/', `${lineNum},${lineColumn}`)
    },
    [toggleShowSearchModal, _navFocusEditor, storage.id]
  )

  useDebounce(
    () => {
      if (searchValue.trim() === '') {
        setResultList([])
        setSearching(false)
        return
      }
      const searchResultData = getSearchResultItems(storage, searchValue)
      searchResultData.forEach((searchResult) => {
        if (searchResult.item.type === 'noteContent') {
          const noteResultKey = excludeNoteIdPrefix(
            searchResult.item.result._id
          )
          noteToSearchResultMap[noteResultKey] = searchResult.results
        }
      })

      setSelectedItemId('')
      setResultList(searchResultData)
      setSearching(false)
    },
    SEARCH_DEBOUNCE_TIMEOUT,
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
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Escape') {
        // TODO: Focus back after modal closed
        toggleShowSearchModal()
      }
    },
    [toggleShowSearchModal]
  )

  const updateSelectedItems = useCallback((note: NoteDoc, itemId: string) => {
    setSelectedItemId(itemId)
    setSelectedNote(note)
  }, [])

  const addMarkers = useCallback(
    (codeEditor, searchValue, selectedItemId = -1) => {
      if (codeEditor) {
        const cursor = codeEditor.getSearchCursor(getSearchRegex(searchValue))
        let first = true
        let from: CodeMirror.Position
        let to: CodeMirror.Position
        let currentItemIndex = 0
        let previousLine = -1
        let lineChanged = false
        while (cursor.findNext()) {
          from = cursor.from()
          to = cursor.to()

          if (first) {
            previousLine = from.line
            first = false
          }

          lineChanged = from.line != previousLine
          previousLine = from.line
          if (GLOBAL_MERGE_SAME_LINE_RESULTS_INTO_ONE) {
            if (lineChanged) {
              currentItemIndex++
            }
          }

          codeEditor.markText(from, to, {
            className:
              currentItemIndex == selectedItemId ? 'marked selected' : 'marked',
          })

          if (!GLOBAL_MERGE_SAME_LINE_RESULTS_INTO_ONE) {
            currentItemIndex++
          }
        }
      }
    },
    []
  )

  const focusEditorOnSelectedItem = useCallback(
    (
      editor: CodeMirror.EditorFromTextArea,
      searchResults: SearchResult[],
      selectedIdx: number
    ) => {
      if (selectedIdx >= searchResults.length) {
        console.warn(
          'Cannot focus editor on selected idx.',
          selectedIdx,
          searchResults.length
        )
        return
      }
      const focusLocation = {
        line: searchResults[selectedIdx].lineNumber - 1,
        ch:
          searchResults[selectedIdx].matchColumn +
          searchResults[selectedIdx].matchLength,
      }
      editor.focus()
      editor.setCursor(focusLocation)

      // Un-focus to searching
      focusTextAreaInput()
    },
    [focusTextAreaInput]
  )

  const updateCodeMirrorMarks = useCallback(
    (codeMirror: CodeMirror.EditorFromTextArea) => {
      if (codeMirror == null) {
        console.warn('code mirror was null, cannot highlight text')
        return
      }

      if (selectedNote?._id == null || selectedItemId == null) {
        return
      }

      const noteResultKey = excludeNoteIdPrefix(selectedNote._id)
      const searchResults: SearchResult[] = noteToSearchResultMap[noteResultKey]
      if (searchResults.length === 0) {
        return
      }

      const selectedItemIdNum =
        selectedItemId && !Number.isNaN(parseInt(selectedItemId))
          ? parseInt(selectedItemId)
          : -1
      addMarkers(codeMirror, searchResults[0].matchString, selectedItemIdNum)
      if (selectedItemIdNum != -1) {
        focusEditorOnSelectedItem(codeMirror, searchResults, selectedItemIdNum)
      }
    },
    [
      addMarkers,
      focusEditorOnSelectedItem,
      noteToSearchResultMap,
      selectedItemId,
      selectedNote,
    ]
  )

  const textAreaRows = useCallback(() => {
    const searchNumLines = searchValue ? searchValue.split('\n').length : 0
    return searchNumLines == 0 || searchNumLines == 1 ? 1 : searchNumLines + 1
  }, [searchValue])

  const closePreview = useCallback(() => {
    setSelectedItemId('')
  }, [])

  return (
    <Container numRows={textAreaRows()}>
      <div className='container' onClick={focusTextAreaInput}>
        <div className='search'>
          <Icon path={mdiMagnify} />
          <textarea
            rows={textAreaRows()}
            onKeyDown={handleSearchInputKeyDown}
            value={searchValue}
            onChange={updateSearchValue}
            ref={searchTextAreaRef}
          />
        </div>
        <div className='list'>
          {searching && <div className='searching'>Searching ...</div>}
          {!searching && resultList.length === 0 && (
            <div className='empty'>No Results</div>
          )}
          {!searching &&
            resultList.map((searchData) => {
              if (searchData.item.type === 'folder') {
                return
              }
              const noteResult: NoteDoc = searchData.item.result
              return (
                <SearchModalNoteResultItem
                  key={noteResult._id}
                  note={noteResult}
                  selectedItemId={
                    selectedNote != null && selectedNote._id == noteResult._id
                      ? selectedItemId
                      : '-1'
                  }
                  titleSearchResult={searchData.titleSearchResult}
                  tagSearchResults={searchData.tagSearchResults}
                  searchResults={searchData.results}
                  updateSelectedItem={updateSelectedItems}
                  navigateToNote={navigateToNote}
                  navigateToEditorFocused={navFocusEditor}
                />
              )
            })}
        </div>
        {selectedItemId &&
          selectedNote != null &&
          !searching &&
          resultList.length > 0 && (
            <EditorPreview>
              <div className='preview-control'>
                <div className='preview-control__location'>
                  <Icon path={mdiCardTextOutline} className='icon' />
                  <span
                    className={cc([
                      'label',
                      selectedNote.title.trim().length === 0 && 'empty',
                    ])}
                  >
                    {selectedNote.title.trim().length > 0
                      ? selectedNote.title
                      : 'Untitled'}
                  </span>
                </div>
                <button
                  className='preview-control__close-button'
                  onClick={closePreview}
                >
                  <Icon path={mdiClose} />
                </button>
              </div>
              <CustomizedCodeEditor
                className='editor'
                key={getSearchResultKey(selectedNote._id, selectedItemId)}
                codeMirrorRef={updateCodeMirrorMarks}
                value={selectedNote.content}
                readonly={true}
              />
            </EditorPreview>
          )}
      </div>
      <div className='shadow' onClick={toggleShowSearchModal} />
    </Container>
  )
}

export default SearchModal

interface TextAreaProps {
  numRows: number
}

const Container = styled.div<BaseTheme & TextAreaProps>`
  z-index: 6000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  & > .container {
    position: relative;
    margin: 50px auto 0;
    background-color: ${({ theme }) => theme.colors.background.primary};
    width: calc(100% - 15px);
    max-width: 720px;
    overflow: hidden;
    z-index: 6002;
    ${border};
    border-radius: 10px;
    max-height: calc(100% - 100px);
    display: flex;
    flex-direction: column;
    & > .search {
      padding: 10px;
      display: flex;
      align-items: ${({ numRows }) =>
        numRows.toString() === '1' ? 'center' : 'self-start'};
      ${borderBottom};
      textarea {
        flex: 1;
        background-color: transparent;
        border: none;
        color: ${({ theme }) => theme.colors.text.primary};

        resize: none;
        max-height: 4em;
        min-height: 1em;
        height: unset;
      }
    }
    & > .list {
      overflow-x: hidden;
      overflow-y: auto;
      flex: 1;
      & > .searching {
        text-align: center;
        color: ${({ theme }) => theme.colors.text.disabled};
        padding: 10px;
      }
      & > .empty {
        text-align: center;
        color: ${({ theme }) => theme.colors.text.disabled};
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

const EditorPreview = styled.div`
  .marked {
    background-color: ${({ theme }) =>
      theme.codeEditorMarkedTextBackgroundColor};
    color: #212121 !important;
    padding: 3px;
  }

  .marked + .marked {
    margin-left: -3px;
    padding-left: 0;
  }

  .selected {
    background-color: ${({ theme }) =>
      theme.codeEditorSelectedTextBackgroundColor};
  }

  background-color: ${({ theme }) => theme.colors.background.primary};

  ${borderTop};
  width: 100%;
  flex: 1;
  flex-shrink: 0;
  height: 324px;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  & > .preview-control {
    flex-shrink: 0;
    display: flex;
    ${borderBottom}
    & > .preview-control__location {
      overflow: hidden;
      flex: 1;
      display: flex;
      align-items: center;
      padding-left: 10px;
      & > .label {
        flex: 1;
        ${textOverflow}
        &.empty {
          color: ${({ theme }) => theme.colors.text.disabled};
        }
      }
      & > .icon {
        flex-shrink: 0;
        margin-right: 2px;
      }
    }
    & > .preview-control__close-button {
      flex-shrink: 0;

      height: 24px;
      width: 24px;
      box-sizing: border-box;
      font-size: 18px;
      outline: none;
      padding: 0 5px;

      background-color: transparent;
      ${flexCenter};

      border: none;
      cursor: pointer;

      transition: color 200ms ease-in-out;
      color: ${({ theme }) => theme.colors.text.secondary};
      &:hover {
        color: ${({ theme }) => theme.colors.text.subtle};
      }

      &:active,
      &.active {
        color: ${({ theme }) => theme.colors.text.link};
      }
    }
  }
  & > .editor {
    flex: 1;
    overflow-y: auto;
  }
  .CodeMirror {
    height: 100%;
  }
`

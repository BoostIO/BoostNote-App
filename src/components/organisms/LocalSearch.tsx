import React, {
  useState,
  ChangeEventHandler,
  useCallback,
  useRef,
  KeyboardEvent,
  useEffect,
  useMemo,
} from 'react'
import { useEffectOnce, useDebounce } from 'react-use'
import { escapeRegExp } from '../../lib/string'
import {
  SEARCH_DEBOUNCE_TIMEOUT,
  LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE,
  getMatchData,
  SearchReplaceOptions,
} from '../../lib/search/search'
import CodeMirror, { MarkerRange, TextMarker } from 'codemirror'
import {
  mdiArrowDown,
  mdiArrowUp,
  mdiClose,
  mdiFormatLetterCase,
  mdiMagnify,
  mdiRegex,
  mdiSubdirectoryArrowLeft,
} from '@mdi/js'
import LocalReplace from './LocalReplace'
import LocalSearchButton from '../atoms/search/LocalSearchButton'
import { SearchResultItem } from '../atoms/search/SearchResultItem'
import { compareEventKeyWithKeymap } from '../../lib/keymap'
import { usePreferences } from '../../lib/preferences'
import styled from '../../shared/lib/styled'
import Icon from '../../shared/components/atoms/Icon'

const LOCAL_SEARCH_MAX_RESULTS = 10000

interface LocalSearchProps {
  searchQuery: string
  replaceQuery: string
  searchOptions: SearchReplaceOptions
  codeMirror: CodeMirror.EditorFromTextArea
  showingReplace: boolean
  onSearchToggle: (showLocalSearch: boolean) => void
  onCursorActivity?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  onSearchQueryChange?: (newSearchQuery: string) => void
  onReplaceToggle?: (nextState?: boolean) => void
  onReplaceQueryChange?: (newSearchQuery: string) => void
  onUpdateSearchOptions: (searchOptions: Partial<SearchReplaceOptions>) => void
}

export type SearchResultNavigationDirection = 'next' | 'previous'

const LocalSearch = ({
  searchQuery,
  replaceQuery,
  searchOptions,
  codeMirror,
  showingReplace,
  onSearchToggle,
  onCursorActivity,
  onSearchQueryChange,
  onReplaceToggle,
  onReplaceQueryChange,
  onUpdateSearchOptions,
}: LocalSearchProps) => {
  const searchTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const replaceTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const [loadingResults, setLoadingResults] = useState<boolean>(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0)
  const [searchValue, setSearchValue] = useState<string>(searchQuery)
  const [caseSensitiveSearch, setCaseSensitiveSearch] = useState<boolean>(
    searchOptions.caseSensitiveSearch
  )
  const [regexSearch, setRegexSearch] = useState<boolean>(
    searchOptions.regexSearch
  )
  const [numberOfFoundItems, setNumberOfFoundItems] = useState<number>(0)
  const [searchResultError, setSearchResultError] = useState<boolean>(false)

  const { preferences } = usePreferences()

  const focusReplaceInput = useCallback((focusPoint = 0) => {
    if (replaceTextAreaRef.current != null) {
      replaceTextAreaRef.current.focus()
      if (focusPoint > 0) {
        replaceTextAreaRef.current.selectionStart = focusPoint
        replaceTextAreaRef.current.selectionEnd = focusPoint
      }
    }
  }, [])

  const getNumberOfTextAreaRows = useMemo(() => {
    const searchNumLines = searchValue ? searchValue.split('\n').length : 0
    return searchNumLines == 0 || searchNumLines == 1 ? 1 : searchNumLines + 1
  }, [searchValue])

  const updateSearchValue: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setSearchValue(event.target.value)
      if (onSearchQueryChange != null) {
        onSearchQueryChange(event.target.value)
      }
    },
    [onSearchQueryChange]
  )

  const focusSearchTextAreaInput = useCallback(
    (searchValueLength = 0, cursorToEnd = false) => {
      if (searchTextAreaRef.current == null) {
        return
      }
      searchTextAreaRef.current.focus()
      if (searchValueLength > 0) {
        searchTextAreaRef.current.selectionEnd += searchValueLength
        if (cursorToEnd) {
          searchTextAreaRef.current.selectionStart =
            searchTextAreaRef.current.selectionEnd
        }
      }
    },
    []
  )

  const getSearchRegex = useCallback(
    (rawSearch, regexSearch: boolean, caseSensitive = caseSensitiveSearch) => {
      try {
        const regExp = new RegExp(
          regexSearch ? rawSearch : escapeRegExp(rawSearch),
          caseSensitive ? 'gm' : 'gim'
        )
        setSearchResultError(() => false)
        return regExp
      } catch (err) {
        setSearchResultError(() => true)
        return null
      }
    },
    [caseSensitiveSearch]
  )

  const clearMarkers = useCallback(() => {
    codeMirror.getAllMarks().forEach((mark) => mark.clear())
    setNumberOfFoundItems(0)
  }, [codeMirror])

  const scrollToLine = useCallback((editor, lineNumber: number) => {
    const t = editor.charCoords({ line: lineNumber, ch: 0 }, 'local').top
    const middleHeight = editor.getScrollerElement().offsetHeight / 2
    editor.scrollTo(null, t - middleHeight - 5)
  }, [])

  const focusSearchItem = useCallback(
    (
      editor: CodeMirror.EditorFromTextArea,
      markers: TextMarker[],
      selectedIndex: number,
      focusingEditor = false,
      updateCursor = false
    ) => {
      if (selectedIndex >= markers.length || selectedIndex < 0) {
        console.warn(
          'Cannot focus editor on selected item.',
          selectedIndex,
          markers.length
        )
        return
      }

      const marker = markers[selectedIndex]
      if (marker == null) {
        return
      }
      const markerPosition: MarkerRange = marker.find() as MarkerRange
      if (markerPosition == null) {
        return
      }
      const focusLocation = {
        line: markerPosition.to.line,
        ch: markerPosition.to.ch,
      }

      if (!focusingEditor) {
        scrollToLine(editor, focusLocation.line)
      }
      if (updateCursor) {
        editor.focus()
        editor.setCursor(focusLocation.line, focusLocation.ch, {
          scroll: true,
        })
        if (focusingEditor && onCursorActivity != null) {
          onCursorActivity(editor)
        }
      }
    },
    [scrollToLine, onCursorActivity]
  )

  const markFoundItems = useCallback(
    (
      codeEditor: CodeMirror.EditorFromTextArea,
      selectedItemIndex = -1,
      regExp: RegExp
    ) => {
      const cursor = codeEditor.getSearchCursor(regExp)
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
        if (LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE) {
          if (lineChanged) {
            currentItemIndex++
          }
        }

        codeEditor.markText(from, to, {
          className:
            currentItemIndex === selectedItemIndex
              ? 'marked selected'
              : 'marked',
          attributes: { dataId: '' + currentItemIndex },
        })
        if (!LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE) {
          currentItemIndex++
        }
      }

      setNumberOfFoundItems(() => codeEditor.getAllMarks().length)
    },
    []
  )

  const navigateToNextItem = useCallback(
    (
      direction: SearchResultNavigationDirection,
      focusingSearchInput = true
    ) => {
      if (loadingResults) {
        return
      }

      const markers = codeMirror.getAllMarks()
      const numberOfMarkers = markers.length
      const newSelectedItemIndex: number = getNewSelectedItemIndex(
        selectedItemIndex,
        numberOfMarkers,
        direction
      )
      if (numberOfMarkers === 1) {
        focusSearchItem(codeMirror, markers, newSelectedItemIndex)
        if (focusingSearchInput) {
          focusSearchTextAreaInput()
        }
        return
      }

      let selectedMarker = null
      let newSelectedMarker = null
      for (const marker of codeMirror.getAllMarks()) {
        if (marker.className === 'marked selected') {
          selectedMarker = marker
        }
        if (
          marker['attributes'] &&
          parseInt(marker['attributes']['dataId']) === newSelectedItemIndex
        ) {
          newSelectedMarker = marker
        }
      }

      if (selectedMarker !== null && newSelectedMarker !== null) {
        updateMarkerStyle(
          codeMirror,
          selectedMarker,
          'marked',
          selectedItemIndex
        )
        updateMarkerStyle(
          codeMirror,
          newSelectedMarker,
          'marked selected',
          newSelectedItemIndex
        )
      }
      setSelectedItemIndex(newSelectedItemIndex)

      const newMarkers = codeMirror.getAllMarks()
      setNumberOfFoundItems(newMarkers.length)
      if (markers.length > 0) {
        focusSearchItem(codeMirror, newMarkers, newSelectedItemIndex)
        if (focusingSearchInput) {
          focusSearchTextAreaInput()
        }
      }
    },
    [
      loadingResults,
      selectedItemIndex,
      codeMirror,
      focusSearchItem,
      focusSearchTextAreaInput,
    ]
  )

  const onSearchClose = useCallback(() => {
    const markers = codeMirror.getAllMarks()
    if (markers.length > 0) {
      focusSearchItem(codeMirror, markers, selectedItemIndex, true, true)
      clearMarkers()
    } else {
      codeMirror.focus()
    }
    if (onSearchToggle != null) {
      onSearchToggle(false)
    }
  }, [
    focusSearchItem,
    clearMarkers,
    codeMirror,
    onSearchToggle,
    selectedItemIndex,
  ])

  const findClosestItemToFocusOn = useCallback(
    (codeEditor, line: number, regExp: RegExp) => {
      let index = 0
      let closestItemIndex = 0
      let minDistance = Number.MAX_SAFE_INTEGER

      const cursor = codeEditor.getSearchCursor(regExp)
      let position
      while (cursor.findNext()) {
        position = cursor.to()
        const markerDistance = Math.abs(position.line - line)
        if (markerDistance < minDistance) {
          minDistance = markerDistance
          closestItemIndex = index
        }

        index++
      }
      return closestItemIndex
    },
    []
  )

  const updateSearchResults = useCallback(
    (
      searchQuery: string,
      regexSearch: boolean,
      caseSensitive: boolean,
      focusingEditor = false,
      updateCursor = false,
      defaultFocusItemIndex: number | null = null,
      forceItemIndexUpdate = false
    ) => {
      clearMarkers()
      if (searchQuery.trim() === '') {
        return
      }

      const regExp = getSearchRegex(searchQuery, regexSearch, caseSensitive)
      if (regExp === null) {
        return
      }
      const focusedItemIndex =
        defaultFocusItemIndex !== null
          ? defaultFocusItemIndex
          : findClosestItemToFocusOn(
              codeMirror,
              codeMirror.getCursor().line,
              regExp
            )
      markFoundItems(codeMirror, focusedItemIndex, regExp)

      const newMarkers: TextMarker[] = codeMirror.getAllMarks()
      if (forceItemIndexUpdate || focusedItemIndex !== selectedItemIndex) {
        setSelectedItemIndex(focusedItemIndex)
      }
      if (newMarkers.length > 0) {
        focusSearchItem(
          codeMirror,
          newMarkers,
          focusedItemIndex,
          focusingEditor,
          updateCursor
        )
      }
    },
    [
      clearMarkers,
      getSearchRegex,
      findClosestItemToFocusOn,
      codeMirror,
      markFoundItems,
      selectedItemIndex,
      focusSearchItem,
    ]
  )

  const addNewlineToSearchValue = useCallback(() => {
    if (searchTextAreaRef.current === null) {
      return
    }
    const startPosition = searchTextAreaRef.current.selectionStart
    const endPosition = searchTextAreaRef.current.selectionEnd
    if (startPosition == endPosition) {
      // no selection -> add newline at this location
      searchTextAreaRef.current.setRangeText(
        '\n',
        startPosition,
        endPosition,
        'end'
      )
    } else {
      // selection -> replace it with newline
      searchTextAreaRef.current.setRangeText(
        '\n',
        startPosition,
        endPosition,
        'end'
      )
    }
    setSearchValue(searchTextAreaRef.current.value)
    if (onSearchQueryChange != null) {
      onSearchQueryChange(searchValue)
    }
    focusSearchTextAreaInput()
  }, [focusSearchTextAreaInput, onSearchQueryChange, searchValue])

  const toggleCaseSensitiveSearch = useCallback(
    (focusOnInput = true) => {
      setCaseSensitiveSearch(!caseSensitiveSearch)
      if (focusOnInput) {
        focusSearchTextAreaInput()
      }
    },
    [caseSensitiveSearch, focusSearchTextAreaInput]
  )

  const toggleRegexSearch = useCallback(
    (focusOnInput = true) => {
      setRegexSearch(!regexSearch)
      if (focusOnInput) {
        focusSearchTextAreaInput()
      }
    },
    [focusSearchTextAreaInput, regexSearch]
  )

  const handleOnReplaceToggle = useCallback(() => {
    if (onReplaceToggle != null) {
      onReplaceToggle()
    }
    focusSearchTextAreaInput(searchValue.length)
  }, [focusSearchTextAreaInput, onReplaceToggle, searchValue.length])

  const handleOnReplaceClose = useCallback(() => {
    onSearchClose()
    if (onReplaceToggle != null) {
      onReplaceToggle()
    }
  }, [onReplaceToggle, onSearchClose])

  const handleOnReplacementFinished = useCallback(() => {
    const regex = getSearchRegex(searchValue, regexSearch, caseSensitiveSearch)
    const numFoundItemsInReplaceQuery = regex
      ? getMatchData(
          replaceQuery,
          regex,
          LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE
        ).length
      : 0
    const itemToFocusOn = selectedItemIndex + numFoundItemsInReplaceQuery
    const numFoundItemsForFocus =
      numFoundItemsInReplaceQuery === 0
        ? numberOfFoundItems - 1
        : numberOfFoundItems
    updateSearchResults(
      searchValue,
      regexSearch,
      caseSensitiveSearch,
      false,
      false,
      itemToFocusOn < numFoundItemsForFocus ? itemToFocusOn : 0,
      true
    )
    focusReplaceInput()
  }, [
    caseSensitiveSearch,
    focusReplaceInput,
    getSearchRegex,
    numberOfFoundItems,
    regexSearch,
    replaceQuery,
    searchValue,
    selectedItemIndex,
    updateSearchResults,
  ])

  const setReplaceTextAreaRef = useCallback((ref) => {
    replaceTextAreaRef.current = ref
  }, [])

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          if (event.ctrlKey && event.shiftKey) {
            addNewlineToSearchValue()
          } else {
            navigateToNextItem('next')
          }
          break
        case 'x':
        case 'X':
          if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            toggleRegexSearch()
          }
          break
        case 'C':
        case 'c':
          if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            toggleCaseSensitiveSearch()
          }
          break
        case 'Tab':
          if (showingReplace) {
            event.preventDefault()
            event.stopPropagation()
            focusReplaceInput(replaceQuery.length)
          }
          break
        case 'F3':
          navigateToNextItem(event.shiftKey ? 'previous' : 'next')
          break
        case 'ArrowDown':
          if (getNumberOfTextAreaRows <= 1) {
            navigateToNextItem('next')
          }
          break
        case 'ArrowUp':
          if (getNumberOfTextAreaRows <= 1) {
            event.preventDefault()
            event.stopPropagation()
            navigateToNextItem('previous')
          }
          break
        case 'Escape':
          onSearchClose()
          break
      }

      const keymap = preferences['general.keymap']
      if (keymap == null || onReplaceToggle == null) {
        return
      }
      const localSearchKeymapItem = keymap.get('toggleLocalSearch')
      if (compareEventKeyWithKeymap(localSearchKeymapItem, event)) {
        onReplaceToggle(false)
      }

      const localReplaceKeymapItem = keymap.get('toggleLocalReplace')
      if (compareEventKeyWithKeymap(localReplaceKeymapItem, event)) {
        event.preventDefault()
        event.stopPropagation()
        onReplaceToggle(true)
      }
    },
    [
      preferences,
      onReplaceToggle,
      showingReplace,
      navigateToNextItem,
      getNumberOfTextAreaRows,
      onSearchClose,
      addNewlineToSearchValue,
      toggleRegexSearch,
      toggleCaseSensitiveSearch,
      focusReplaceInput,
      replaceQuery.length,
    ]
  )

  useEffect(() => {
    function onContentChanges() {
      updateSearchResults(
        searchValue,
        regexSearch,
        caseSensitiveSearch,
        true,
        false
      )
    }
    /*
     * Be care of the difference between this two events 'change' and 'changes'
     * The 'changes' event batches operations and is called only once per operation
     * (with list of all changes).
     * The 'change' event is called for each single operation once.
     */
    codeMirror.on('changes', onContentChanges)
    return () => {
      codeMirror.off('changes', onContentChanges)
    }
  }, [
    caseSensitiveSearch,
    codeMirror,
    getSearchRegex,
    regexSearch,
    searchValue,
    updateSearchResults,
  ])

  useEffectOnce(() => {
    updateSearchResults(searchValue, regexSearch, caseSensitiveSearch)
    if (showingReplace && searchValue.length !== 0) {
      focusReplaceInput(replaceQuery.length)
    } else {
      focusSearchTextAreaInput(searchValue.length, true)
    }
  })

  useEffect(() => {
    if (loadingResults) {
      updateSearchResults(
        searchValue,
        regexSearch,
        caseSensitiveSearch,
        false,
        false
      )
      if (onUpdateSearchOptions != null) {
        onUpdateSearchOptions({
          caseSensitiveSearch: caseSensitiveSearch,
          regexSearch: regexSearch,
        })
      }
      setLoadingResults(false)
    }
  }, [
    caseSensitiveSearch,
    loadingResults,
    onUpdateSearchOptions,
    regexSearch,
    searchValue,
    updateSearchResults,
  ])

  useDebounce(
    () => {
      setLoadingResults(true)
    },
    SEARCH_DEBOUNCE_TIMEOUT,
    [searchValue, regexSearch, caseSensitiveSearch]
  )

  return (
    <LocalSearchContainer>
      <SearchResultItem>
        <LocalSearchInputLeft>
          <LocalSearchIcon
            className={getNumberOfTextAreaRows != 1 ? 'alignStart' : ''}
          >
            <Icon path={mdiMagnify} />
          </LocalSearchIcon>
          <textarea
            onClick={focusSearchTextAreaInput}
            rows={getNumberOfTextAreaRows}
            value={searchValue}
            onInput={updateSearchValue}
            onChange={updateSearchValue}
            // onChange={() => undefined}
            onKeyDown={handleSearchInputKeyDown}
            ref={searchTextAreaRef}
          />
          <SearchOptionsInnerContainer>
            <LocalSearchButton
              title={'New Line (Ctrl+Shift+Enter)'}
              onClick={addNewlineToSearchValue}
              iconPath={mdiSubdirectoryArrowLeft}
            />
            <LocalSearchButton
              className={caseSensitiveSearch ? 'active' : ''}
              title={
                'Match Case (Alt+C) - Use tab to focus on an option and space to toggle'
              }
              onClick={toggleCaseSensitiveSearch}
              iconPath={mdiFormatLetterCase}
            />
            <LocalSearchButton
              title={
                'Regex (Alt+X) - Use tab to focus on an option and space to toggle'
              }
              className={regexSearch ? 'active' : ''}
              onClick={toggleRegexSearch}
              iconPath={mdiRegex}
            />
          </SearchOptionsInnerContainer>
        </LocalSearchInputLeft>
        <LocalSearchInputRightContainer>
          <NumResultsContainer>
            {numberOfFoundItems > 0 ? (
              numberOfFoundItems < LOCAL_SEARCH_MAX_RESULTS ? (
                `${selectedItemIndex + 1}/${numberOfFoundItems}`
              ) : (
                '10,000+'
              )
            ) : (
              <ResultStatusContainer
                className={searchResultError ? 'error' : ''}
              >
                {regexSearch && searchResultError ? 'Bad pattern' : '0 results'}
              </ResultStatusContainer>
            )}
          </NumResultsContainer>
          <SearchOptionsOuterContainer>
            <SearchNavOptions>
              <LocalSearchButton
                disabled={numberOfFoundItems === 0}
                title={'Previous Occurrence (Shift+F3)'}
                className={'button'}
                onClick={() => navigateToNextItem('previous')}
                iconPath={mdiArrowUp}
              />
              <LocalSearchButton
                disabled={numberOfFoundItems === 0}
                title={'Next Occurrence (F3)'}
                className={'button'}
                onClick={() => navigateToNextItem('next')}
                iconPath={mdiArrowDown}
              />
            </SearchNavOptions>
          </SearchOptionsOuterContainer>
          <LocalSearchInputRightClose>
            <LocalSearchButton
              className={'button'}
              onClick={onSearchClose}
              iconPath={mdiClose}
            />
          </LocalSearchInputRightClose>
        </LocalSearchInputRightContainer>
      </SearchResultItem>
      {showingReplace && (
        <LocalReplace
          searchOptions={searchOptions}
          codeMirror={codeMirror}
          replaceQuery={replaceQuery}
          numberOfFoundItems={numberOfFoundItems}
          navigateToNext={(direction) => {
            navigateToNextItem(direction, false)
            focusReplaceInput()
          }}
          onReplaceToggle={handleOnReplaceToggle}
          onReplaceQueryChange={onReplaceQueryChange}
          onReplacementFinished={handleOnReplacementFinished}
          onFocusSearchInput={() =>
            focusSearchTextAreaInput(searchQuery.length, true)
          }
          onReplaceClose={handleOnReplaceClose}
          onUpdateSearchOptions={onUpdateSearchOptions}
          setReplaceTextAreaRef={setReplaceTextAreaRef}
        />
      )}
    </LocalSearchContainer>
  )
}

export default LocalSearch

const SearchOptionsOuterContainer = styled.div`
  justify-content: center;
  align-content: center;
`

const SearchNavOptions = styled.div``

const SearchOptionsInnerContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-items: center;
  justify-content: center;
  align-content: center;
`

const NumResultsContainer = styled.div`
  padding-top: 4px;
  padding-left: 4px;
  padding-right: 4px;
`

const ResultStatusContainer = styled.div`
  color: #b8b8b6;
  &.error {
    color: #fa5a4f;
  }
`

const LocalSearchIcon = styled.div`
  display: flex;
  align-items: center;
  &.alignStart {
    align-items: self-start;
  }
`

export const LocalSearchInputLeft = styled.div`
  display: flex;
  padding: 6px;
  min-width: 40%;
  max-width: 50%;

  textarea {
    flex: 1;
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text.primary};

    resize: none;
    max-height: 6em;
    min-height: 1em;
    height: unset;
  }
`

export const LocalSearchInputRightContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 6px 6px 0 0;
  justify-items: center;
  justify-content: center;
  align-content: stretch;
  align-self: stretch;
  align-items: flex-start;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`

export const LocalSearchInputRightClose = styled.div`
  margin-left: auto;
`

const LocalSearchContainer = styled.div`
  z-index: 5001;
  background-color: ${({ theme }) => theme.colors.background.tertiary};
`

function updateMarkerStyle(
  cm: CodeMirror.Editor,
  marker: TextMarker,
  className: string,
  index: number
) {
  const markPos: MarkerRange = marker.find() as MarkerRange
  if (!markPos) {
    return
  }
  marker.clear()
  cm.markText(markPos.from, markPos.to, {
    className: className,
    attributes: { dataId: index + '' },
  })
}

function getNewSelectedItemIndex(
  currentSelectedIndex: number,
  numberOfMarkers: number,
  direction: 'previous' | 'next'
) {
  if (direction == 'previous') {
    if (currentSelectedIndex - 1 >= 0) {
      return currentSelectedIndex - 1
    } else {
      // go to last (circular motion)
      return numberOfMarkers - 1
    }
  } else {
    const selectedItemIsLast = currentSelectedIndex + 1 < numberOfMarkers
    if (selectedItemIsLast) {
      return currentSelectedIndex + 1
    } else {
      // go back to first (circular motion)
      return 0
    }
  }
}

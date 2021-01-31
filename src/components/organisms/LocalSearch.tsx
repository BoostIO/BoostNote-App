import React, {
  useState,
  ChangeEventHandler,
  useCallback,
  useRef,
  KeyboardEvent,
  useEffect,
} from 'react'
import { useEffectOnce, useDebounce } from 'react-use'
import { escapeRegExp } from '../../lib/string'
import {
  SEARCH_DEBOUNCE_TIMEOUT,
  LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE,
  getMatchData,
} from '../../lib/search/search'
import CodeMirror, {
  EditorChangeLinkedList,
  MarkerRange,
  TextMarker,
} from 'codemirror'
import Icon from '../atoms/Icon'
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
import styled from '../../lib/styled/styled'
import { BaseTheme } from '../../lib/styled/BaseTheme'
import { SearchReplaceOptions } from './NoteDetail'

const LOCAL_SEARCH_MAX_RESULTS = 10000

interface LocalSearchProps {
  searchQuery: string
  replaceQuery: string
  searchOptions: SearchReplaceOptions
  codeMirror: CodeMirror.EditorFromTextArea
  showReplace: boolean
  onSearchToggle?: (nextState?: boolean) => void
  onCursorActivity?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  onSearchQueryChange?: (newSearchQuery: string) => void
  onReplaceToggle?: (nextState?: boolean) => void
  onReplaceQueryChange?: (newSearchQuery: string) => void
  onUpdateSearchOptions: (searchOptions: Partial<SearchReplaceOptions>) => void
}

export enum SearchResultNavigationDirection {
  NEXT,
  PREVIOUS,
}

// todo: [komediruzecki-13/02/2021] Would this be better as React.Component
//  are there any benefits from component or this works fine with hooks -
//  since we need to save state on close (search/Replace value, selected options)?
const LocalSearch = ({
  searchQuery,
  replaceQuery,
  searchOptions,
  codeMirror,
  showReplace,
  onSearchToggle,
  onCursorActivity,
  onSearchQueryChange,
  onReplaceToggle,
  onReplaceQueryChange,
  onUpdateSearchOptions,
}: LocalSearchProps) => {
  const searchTextAreaRef = useRef<HTMLTextAreaElement>(null)

  const [loadingResults, setLoadingResults] = useState<boolean>(false)
  const [selectedItemId, setSelectedItemId] = useState<number>(0)
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [caseSensitiveSearch, setCaseSensitiveSearch] = useState<boolean>(
    searchOptions.caseSensitiveSearch
  )
  const [regexSearch, setRegexSearch] = useState<boolean>(
    searchOptions.regexSearch
  )
  const [numFoundItems, setNumFoundItems] = useState<number>(0)
  const [searchResultError, setSearchResultError] = useState<boolean>(false)

  const [focusingReplace, setFocusingReplace] = useState<boolean>(false)

  const textAreaRows = useCallback(() => {
    const searchNumLines = searchValue ? searchValue.split('\n').length : 0
    return searchNumLines == 0 || searchNumLines == 1 ? 1 : searchNumLines + 1
  }, [searchValue])

  const updateSearchValue: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setSearchValue(event.target.value)
      if (onSearchQueryChange) {
        onSearchQueryChange(event.target.value)
      }
    },
    [onSearchQueryChange]
  )

  const focusSearchTextAreaInput = useCallback(
    (searchValueLength?: number, cursorToEnd = false) => {
      if (searchTextAreaRef.current == null) {
        return
      }
      searchTextAreaRef.current.focus()
      if (searchValueLength && searchValueLength > 0) {
        searchTextAreaRef.current.selectionEnd += searchValueLength
        if (cursorToEnd) {
          searchTextAreaRef.current.selectionStart =
            searchTextAreaRef.current.selectionEnd
        }
      }

      setFocusingReplace(false)
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
        // set error for better user acknowledge
        setSearchResultError(() => true)
        return null
      }
    },
    [caseSensitiveSearch]
  )

  const clearMarkers = useCallback(() => {
    codeMirror.getAllMarks().forEach((mark) => mark.clear())
    setNumFoundItems(0)
  }, [codeMirror])

  const editorJumpToLineCentered = useCallback((editor, lineNumber: number) => {
    const t = editor.charCoords({ line: lineNumber, ch: 0 }, 'local').top
    const middleHeight = editor.getScrollerElement().offsetHeight / 2
    editor.scrollTo(null, t - middleHeight - 5)
  }, [])

  const bringSearchItemToFocus = useCallback(
    (
      editor: CodeMirror.EditorFromTextArea,
      markers: TextMarker[],
      selectedIdx: number,
      focusingEditor = false,
      updateCursor = false
    ) => {
      if (selectedIdx >= markers.length || selectedIdx < 0) {
        console.warn(
          'Cannot focus editor on selected item.',
          selectedIdx,
          markers.length
        )
        return
      }

      const marker = markers[selectedIdx]
      if (!marker) {
        return
      }
      const markPos: MarkerRange = marker.find() as MarkerRange
      if (!markPos) {
        return
      }
      const focusLocation = {
        line: markPos.to.line,
        ch: markPos.to.ch,
      }

      if (!focusingEditor) {
        editorJumpToLineCentered(editor, focusLocation.line)
      }
      if (updateCursor) {
        editor.focus()
        editor.setCursor(focusLocation.line, focusLocation.ch, {
          scroll: true,
        })
        if (focusingEditor && onCursorActivity) {
          onCursorActivity(editor)
        }
      }
    },
    [editorJumpToLineCentered, onCursorActivity]
  )

  const markFoundItems = useCallback(
    (codeEditor, selectedItemIdx = -1, regExp) => {
      const cursor = codeEditor.getSearchCursor(regExp)
      let first = true
      let from, to
      let currentItemId = 0
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
            currentItemId++
          }
        }

        codeEditor.markText(from, to, {
          className:
            currentItemId === selectedItemIdx ? 'marked selected' : 'marked',
          attributes: { dataId: '' + currentItemId },
        })
        if (!LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE) {
          currentItemId++
        }
      }

      setNumFoundItems(() => codeEditor.getAllMarks().length)
    },
    []
  )

  const navigateToNextItem = useCallback(
    (direction: number, focusingSearchInput = true) => {
      if (loadingResults) {
        return
      }
      let newSelectedItemId: number = selectedItemId
      const markers = codeMirror.getAllMarks()
      const numOfMarkers = markers.length
      if (numOfMarkers === 1) {
        // Just focus
        bringSearchItemToFocus(codeMirror, markers, newSelectedItemId)
        if (focusingSearchInput) {
          focusSearchTextAreaInput(0)
        }
        return
      }
      if (direction == SearchResultNavigationDirection.PREVIOUS) {
        // Go to previous item
        if (selectedItemId - 1 >= 0) {
          newSelectedItemId--
        } else {
          // go to last (circular motion)
          newSelectedItemId = numOfMarkers - 1
        }
      } else {
        // Go to next item
        if (selectedItemId + 1 < numOfMarkers) {
          newSelectedItemId++
        } else {
          // go back to first (circular motion)
          newSelectedItemId = 0
        }
      }

      // we have new selected item - let's update it's marker class
      let selectedMarker = null
      let newSelectedMarker = null
      for (const marker of codeMirror.getAllMarks()) {
        if (marker.className === 'marked selected') {
          selectedMarker = marker
        }
        if (
          marker['attributes'] &&
          parseInt(marker['attributes']['dataId']) === newSelectedItemId
        ) {
          newSelectedMarker = marker
        }
      }

      if (selectedMarker !== null && newSelectedMarker !== null) {
        updateMarkerStyle(codeMirror, selectedMarker, 'marked', selectedItemId)
        updateMarkerStyle(
          codeMirror,
          newSelectedMarker,
          'marked selected',
          newSelectedItemId
        )
      }
      setSelectedItemId(newSelectedItemId)

      // Markers are cleared and re-added (but same IDs and positions) so we retrieve new ones
      const newMarkers = codeMirror.getAllMarks()
      setNumFoundItems(newMarkers.length)
      if (markers.length > 0) {
        bringSearchItemToFocus(codeMirror, newMarkers, newSelectedItemId)
        if (focusingSearchInput) {
          focusSearchTextAreaInput(0)
        }
      }
    },
    [
      loadingResults,
      selectedItemId,
      codeMirror,
      bringSearchItemToFocus,
      focusSearchTextAreaInput,
    ]
  )

  const onSearchClose = useCallback(() => {
    const markers = codeMirror.getAllMarks()
    if (markers.length > 0) {
      bringSearchItemToFocus(codeMirror, markers, selectedItemId, true, true)
      clearMarkers()
    } else {
      codeMirror.focus()
    }
    if (onSearchToggle != null) {
      onSearchToggle(false)
    }
  }, [
    bringSearchItemToFocus,
    clearMarkers,
    codeMirror,
    onSearchToggle,
    selectedItemId,
  ])

  const findClosestItemToFocusOn = useCallback(
    (codeEditor, line: number, regExp: RegExp) => {
      let currentItemId = 0
      let closestId = 0
      let minDistance = Number.MAX_SAFE_INTEGER

      const cursor = codeEditor.getSearchCursor(regExp)
      let markerPos
      while (cursor.findNext()) {
        markerPos = cursor.to()
        const markerDistance = Math.abs(markerPos.line - line)
        if (markerDistance < minDistance) {
          minDistance = markerDistance
          closestId = currentItemId
        }

        currentItemId++
      }
      return closestId
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
      defaultFocusItemId: number | null = null
    ) => {
      clearMarkers()
      if (searchQuery.trim() === '') {
        return
      }

      const regExp = getSearchRegex(searchQuery, regexSearch, caseSensitive)
      if (regExp === null) {
        return
      }
      const itemToFocusOn =
        defaultFocusItemId !== null
          ? defaultFocusItemId
          : findClosestItemToFocusOn(
              codeMirror,
              codeMirror.getCursor().line,
              regExp
            )
      markFoundItems(codeMirror, itemToFocusOn, regExp)

      const newMarkers: TextMarker[] = codeMirror.getAllMarks()
      if (itemToFocusOn !== selectedItemId) {
        setSelectedItemId(itemToFocusOn)
      }
      if (newMarkers.length > 0) {
        bringSearchItemToFocus(
          codeMirror,
          newMarkers,
          itemToFocusOn,
          focusingEditor,
          updateCursor
        )
      }
    },
    [
      bringSearchItemToFocus,
      clearMarkers,
      codeMirror,
      findClosestItemToFocusOn,
      getSearchRegex,
      markFoundItems,
      selectedItemId,
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
    if (onSearchQueryChange) {
      onSearchQueryChange(searchValue)
    }
  }, [onSearchQueryChange, searchValue])

  const toggleCaseSensitiveSearch = useCallback(
    (focusOnInput = true) => {
      setCaseSensitiveSearch(!caseSensitiveSearch)
      if (focusOnInput) {
        focusSearchTextAreaInput(0)
      }
    },
    [caseSensitiveSearch, focusSearchTextAreaInput]
  )

  const toggleRegexSearch = useCallback(
    (focusOnInput = true) => {
      setRegexSearch(!regexSearch)
      if (focusOnInput) {
        focusSearchTextAreaInput(0)
      }
    },
    [focusSearchTextAreaInput, regexSearch]
  )

  const handleOnReplaceToggle = useCallback(() => {
    if (onReplaceToggle) {
      onReplaceToggle()
    }
    focusSearchTextAreaInput(searchValue.length)
  }, [focusSearchTextAreaInput, onReplaceToggle, searchValue.length])

  const handleOnReplaceClose = useCallback(() => {
    onSearchClose()
    if (onReplaceToggle) {
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
    const itemToFocusOn = selectedItemId + numFoundItemsInReplaceQuery
    const numFoundItemsForFocus =
      numFoundItemsInReplaceQuery === 0 ? numFoundItems - 1 : numFoundItems
    updateSearchResults(
      searchValue,
      regexSearch,
      caseSensitiveSearch,
      false,
      false,
      itemToFocusOn < numFoundItemsForFocus ? itemToFocusOn : 0
    )
    setFocusingReplace(true)
  }, [
    caseSensitiveSearch,
    getSearchRegex,
    numFoundItems,
    regexSearch,
    replaceQuery,
    searchValue,
    selectedItemId,
    updateSearchResults,
  ])

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          if (event.ctrlKey && event.shiftKey) {
            addNewlineToSearchValue()
          } else {
            navigateToNextItem(SearchResultNavigationDirection.NEXT)
          }
          break
        // todo: [komediruzecki-14/02/2021] Change this key binding to CTRL+R or
        //  or something better when codemirror shortcut gets updated
        case 'h':
        case 'H':
          if (event.ctrlKey && onReplaceToggle) {
            event.preventDefault()
            event.stopPropagation()
            onReplaceToggle(true)
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
          // Focus replace if open
          if (showReplace) {
            event.preventDefault()
            event.stopPropagation()
            setFocusingReplace(true)
          }
          break
        case 'F3':
          navigateToNextItem(
            event.shiftKey
              ? SearchResultNavigationDirection.PREVIOUS
              : SearchResultNavigationDirection.NEXT
          )
          break
        case 'Down': // IE/Edge specific value
        case 'ArrowDown':
          if (textAreaRows() <= 1) {
            navigateToNextItem(SearchResultNavigationDirection.NEXT)
          }
          break
        case 'Up': // IE/Edge specific value
        case 'ArrowUp':
          if (textAreaRows() <= 1) {
            event.preventDefault()
            event.stopPropagation()
            navigateToNextItem(SearchResultNavigationDirection.PREVIOUS)
          }
          break
        case 'Escape':
          onSearchClose()
          break
        case 'F':
        case 'f':
          if (event.ctrlKey && onReplaceToggle) {
            onReplaceToggle(false)
          }
          break
      }
    },
    [
      addNewlineToSearchValue,
      navigateToNextItem,
      onReplaceToggle,
      onSearchClose,
      showReplace,
      textAreaRows,
      toggleCaseSensitiveSearch,
      toggleRegexSearch,
    ]
  )

  useEffect(() => {
    function onContentChange(
      _: CodeMirror.Editor,
      changes: EditorChangeLinkedList
    ) {
      if (changes.origin == '@ignore') {
        return
      }

      /*
       * Optimized version: looks at current line and removed text to get info about changes then
       * if any match is found updates search results (does not work for adding change which removes any match)
       * Non-optimized version gets whole document and match it and then see if number of found items
       * changed (does not work for case when change introduces no new items but changes marked range)
       * No optimization: Update always since only this will keep consistency (works in all cases)
       */
      // let lineText
      // if (changes.from.line === changes.to.line) {
      //   lineText =
      //     cm.getLine(changes.from.line) +
      //     '\n' +
      //     changes.text.slice(1).join('\n')
      // } else {
      //   lineText = changes.text.join('\n')
      // }
      // const removed = changes.removed?.join('\n') ?? ''
      // const changedContent = lineText + removed
      // let shouldUpdateResults = false
      // if (regexSearch) {
      //   shouldUpdateResults = true
      // } else {
      //   const changedContent = cm.getValue()
      //   const regex = getSearchRegex(
      //     searchValue,
      //     regexSearch,
      //     caseSensitiveSearch
      //   )
      //   if (!regex) return
      //   const matchDataContent = getMatchData(
      //     changedContent,
      //     regex,
      //     LOCAL_MERGE_SAME_LINE_RESULTS_INTO_ONE
      //   )
      //   if (matchDataContent.length !== numFoundItems) {
      //     shouldUpdateResults = true
      //   }
      // }
      // if (!shouldUpdateResults) {
      //   return
      // }

      // restore replace focus before updating results otherwise it might render
      // out of focus because value don't have time to propagate
      setFocusingReplace(false)
      updateSearchResults(
        searchValue,
        regexSearch,
        caseSensitiveSearch,
        true,
        false
      )
    }
    codeMirror.on('change', onContentChange)
    return () => {
      codeMirror.off('change', onContentChange)
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
    if (showReplace && searchValue.length !== 0) {
      setFocusingReplace(true)
    } else {
      focusSearchTextAreaInput(searchValue.length, true)
    }
  })

  /* todo: [komediruzecki-13/02/2021] Can this be improved without React.Component?
   *  the issue is that we want to disable navigation and other buttons while updating search results
   *  the operations pipeline would be:
   *    1. Disable UI while updating results
   *    2. Update search results (set selected item, number of found items, ...)
   *    3. Enable UI
   *  the solution used here is done with loading state
   *  debounce is used to separate frequent request and on dependency list the
   *  found loading state is updated, after that useEffect is
   *  listening on dependency and updates the search results
   *  (this way UI have time to update (disable buttons) and after search results are loaded)
   */
  useEffect(() => {
    if (loadingResults) {
      updateSearchResults(
        searchValue,
        regexSearch,
        caseSensitiveSearch,
        false,
        false
      )
      if (onUpdateSearchOptions) {
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
          <LocalSearchIcon numRows={textAreaRows}>
            <Icon path={mdiMagnify} />
          </LocalSearchIcon>
          <textarea
            onClick={() => focusSearchTextAreaInput(0)}
            rows={textAreaRows()}
            value={searchValue}
            onChange={updateSearchValue}
            onKeyDown={handleSearchInputKeyDown}
            ref={searchTextAreaRef}
          />
          <SearchOptionsInnerContainer>
            <LocalSearchStyledButton
              title={'Enter newline'}
              onClick={addNewlineToSearchValue}
            >
              <Icon path={mdiSubdirectoryArrowLeft} />
            </LocalSearchStyledButton>
            <LocalSearchStyledButton
              className={caseSensitiveSearch ? 'active' : ''}
              title={
                'Match case Alt+C - Use tab to focus on an option and space to toggle'
              }
              onClick={toggleCaseSensitiveSearch}
            >
              <Icon path={mdiFormatLetterCase} />
            </LocalSearchStyledButton>
            <LocalSearchStyledButton
              title={
                'Regex Alt+X - Use tab to focus on an option and space to toggle'
              }
              className={regexSearch ? 'active' : ''}
              onClick={toggleRegexSearch}
            >
              <Icon path={mdiRegex} />
            </LocalSearchStyledButton>
          </SearchOptionsInnerContainer>
        </LocalSearchInputLeft>
        <LocalSearchInputRightContainer>
          <NumResultsContainer key={numFoundItems}>
            {numFoundItems > 0 ? (
              numFoundItems < LOCAL_SEARCH_MAX_RESULTS ? (
                `${selectedItemId + 1}/${numFoundItems}`
              ) : (
                '10,000+'
              )
            ) : (
              <ResultStatusContainer resultError={searchResultError}>
                {regexSearch && searchResultError ? 'Bad pattern' : '0 results'}
              </ResultStatusContainer>
            )}
          </NumResultsContainer>
          <SearchOptionsOuterContainer>
            <SearchNavOptions>
              <LocalSearchStyledButton
                disabled={numFoundItems === 0}
                title={'Previous occurrence (Shift+F3)'}
                className={'button'}
                onClick={() =>
                  navigateToNextItem(SearchResultNavigationDirection.PREVIOUS)
                }
              >
                <Icon path={mdiArrowUp} />
              </LocalSearchStyledButton>
              <LocalSearchStyledButton
                disabled={numFoundItems === 0}
                title={'Next occurrence (F3)'}
                className={'button'}
                onClick={() =>
                  navigateToNextItem(SearchResultNavigationDirection.NEXT)
                }
              >
                <Icon path={mdiArrowDown} />
              </LocalSearchStyledButton>
            </SearchNavOptions>
          </SearchOptionsOuterContainer>
          <LocalSearchInputRightClose>
            <LocalSearchStyledButton
              className={'button'}
              onClick={onSearchClose}
            >
              <Icon path={mdiClose} />
            </LocalSearchStyledButton>
          </LocalSearchInputRightClose>
        </LocalSearchInputRightContainer>
      </SearchResultItem>
      {showReplace && (
        <LocalReplace
          key={focusingReplace + '' + (numFoundItems + '')}
          searchOptions={searchOptions}
          codeMirror={codeMirror}
          replaceQuery={replaceQuery}
          numFoundItems={numFoundItems}
          focusingReplace={focusingReplace}
          navigateToNext={(direction) => {
            navigateToNextItem(direction, false)
            setFocusingReplace(true)
          }}
          onReplaceToggle={handleOnReplaceToggle}
          onReplaceQueryChange={onReplaceQueryChange}
          onReplacementFinished={handleOnReplacementFinished}
          onFocusSearchInput={focusSearchTextAreaInput}
          onReplaceClose={handleOnReplaceClose}
          onUpdateSearchOptions={onUpdateSearchOptions}
        />
      )}
    </LocalSearchContainer>
  )
}

export default LocalSearch

export interface LocalSearchTextAreaProps {
  numRows: number
}

export const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
`

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
  padding-left: 4px;
  padding-right: 4px;
`

const ResultStatusContainer = styled.div<BaseTheme & { resultError: boolean }>`
  color: ${({ resultError }) => (resultError === true ? '#FA5A4F' : '#B8B8B6')};
`

export const LocalSearchStyledButton = styled.button`
  background-color: transparent;
  cursor: pointer;

  width: 22px;
  height: 22px;
  padding: 3px;
  font-weight: bolder;
  font-size: 16px;

  overflow: hidden;
  border-radius: 0;
  border: none;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
    color: #61a8e1;
    border-radius: 3px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
    &:hover {
      color: ${({ theme }) => theme.navItemColor};
    }
  }

  &:focus {
    opacity: 0.6;
    background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
    outline: 1px solid #61a8e1;
    border-radius: 3px;
  }
`

const LocalSearchIcon = styled.div<BaseTheme & LocalSearchTextAreaProps>`
  display: flex;
  align-items: ${({ numRows }) => (numRows == 1 ? 'center' : 'self-start')};
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
    color: ${({ theme }) => theme.uiTextColor};

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
  background-color: ${({ theme }) => theme.searchSecondaryBackgroundColor};
`

export const LocalSearchInputRightClose = styled.div`
  margin-left: auto;
`

const LocalSearchContainer = styled.div`
  z-index: 5001;
  background-color: ${({ theme }) => theme.navBackgroundColor};
`

function updateMarkerStyle(
  cm: CodeMirror.Editor,
  marker: TextMarker,
  className: string,
  dataId: number
) {
  const markPos: MarkerRange = marker.find() as MarkerRange
  if (!markPos) {
    return
  }
  marker.clear()
  cm.markText(markPos.from, markPos.to, {
    className: className,
    attributes: { dataId: dataId + '' },
  })
}

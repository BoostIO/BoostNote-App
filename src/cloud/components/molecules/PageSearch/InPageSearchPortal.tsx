import React, {
  ChangeEventHandler,
  useCallback,
  useState,
  KeyboardEvent,
  useRef,
  useEffect,
} from 'react'
import {
  mdiChevronLeftBoxOutline,
  mdiChevronRightBoxOutline,
  mdiMagnify,
} from '@mdi/js'
import { findInPage, stopFindInPage } from '../../../../lib/electronOnly'
import { useDebounce } from 'react-use'
import cc from 'classcat'
import {
  addToWebContents,
  removeFromWebContents,
} from '../../../lib/stores/electron'
import Button from '../../../../design/components/atoms/Button'
import Portal from '../../../../design/components/atoms/Portal'
import Icon from '../../../../design/components/atoms/Icon'
import styled from '../../../../design/lib/styled'

export interface InPageSearchEventProps {
  result: Object
  requestId: number
  finalUpdate: boolean
  matches?: number
  selectionArea?: Object
}

const InPageSearchPortal = ({ children }: { children: any }) => {
  const portalContainer = document.getElementById('inPageSearchContainer')!
  return <Portal target={portalContainer}>{children}</Portal>
}

export interface InPageSearchProps {
  onSearchClose: () => void
}

const INPUT_HIDE_TIMEOUT = 10
const INPUT_DEBOUNCE_TIMEOUT = 600

export const InPageSearch = ({ onSearchClose }: InPageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [findRequestId, setFindRequestId] = useState<number | null>(null)
  const [hidingInput, setHidingInput] = useState<boolean>(false)
  const searchTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const [caseSensitiveSearch, setCaseSensitiveSearch] = useState<boolean>(false)
  const [numberOfMatches, setNumberOfMatches] = useState<number | null>(null)

  const updateSearchValue: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setSearchQuery(event.target.value)
    },
    []
  )

  const closeSearch = useCallback(() => {
    stopFindInPage('clearSelection')
    onSearchClose()
  }, [onSearchClose])

  const focusSearchTextAreaInput = useCallback(
    (searchValueLength = 0, cursorToEnd = true) => {
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

  const navigateResults = useCallback(
    (direction: 'next' | 'previous') => {
      setHidingInput(true)
      if (findRequestId != null) {
        findInPage(searchQuery, {
          matchCase: caseSensitiveSearch,
          forward: direction == 'next',
          findNext: false,
        })
      }

      setTimeout(() => {
        setHidingInput(false)
        focusSearchTextAreaInput(searchQuery.length)
      }, INPUT_HIDE_TIMEOUT)
    },
    [caseSensitiveSearch, findRequestId, focusSearchTextAreaInput, searchQuery]
  )

  const toggleCaseSensitiveSearch = useCallback(
    (focusOnInput = true) => {
      setCaseSensitiveSearch(!caseSensitiveSearch)
      if (focusOnInput) {
        focusSearchTextAreaInput()
      }
    },
    [caseSensitiveSearch, focusSearchTextAreaInput]
  )

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          navigateResults('next')
          break
        case 'c':
          if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            toggleCaseSensitiveSearch()
          }
          break
        case 'F3':
          navigateResults(event.shiftKey ? 'previous' : 'next')
          break
        case 'ArrowDown':
          navigateResults('next')
          break
        case 'ArrowUp':
          event.preventDefault()
          event.stopPropagation()
          navigateResults('previous')
          break
        case 'Escape':
          closeSearch()
          break
      }
    },
    [closeSearch, navigateResults, toggleCaseSensitiveSearch]
  )

  const listenInPageSearchResults = useCallback((results) => {
    if (results == null || !results.matches) {
      setNumberOfMatches(null)
      return
    }
    setNumberOfMatches(results.matches)
  }, [])

  useDebounce(
    async () => {
      if (searchQuery.trim() === '') {
        setNumberOfMatches(null)
        return
      }

      setHidingInput(true)
      const findRequestId = findInPage(searchQuery, {
        matchCase: caseSensitiveSearch,
        findNext: true,
      })
      setFindRequestId(findRequestId)
      setTimeout(() => {
        setHidingInput(false)
        focusSearchTextAreaInput(searchQuery.length)
      }, INPUT_HIDE_TIMEOUT)
    },
    INPUT_DEBOUNCE_TIMEOUT,
    [searchQuery, caseSensitiveSearch]
  )

  useEffect(() => {
    focusSearchTextAreaInput(searchQuery.length)
    setFindRequestId(null)
  }, [focusSearchTextAreaInput, searchQuery])

  useEffect(() => {
    addToWebContents(
      'found-in-page',
      (_: any, result: InPageSearchEventProps) => {
        listenInPageSearchResults(result)
      }
    )
    return () => {
      removeFromWebContents('found-in-page', listenInPageSearchResults)
    }
  }, [listenInPageSearchResults])
  return (
    <InPageSearchPortal>
      <SearchContainer
        className={cc([hidingInput && 'search__component__hidden'])}
      >
        {numberOfMatches != null && (
          <NumberOfMatchesContainer
            className={cc([hidingInput && 'search__component__hidden'])}
          >
            {numberOfMatches == 0 ? 'No matches' : numberOfMatches + ' matches'}
          </NumberOfMatchesContainer>
        )}
        <SearchNavigationContainer>
          <Button
            className={'search__navigation__button__style'}
            iconSize={20}
            iconPath={mdiChevronLeftBoxOutline}
            variant={'transparent'}
            onClick={() => navigateResults('previous')}
          />
          <Button
            className={'search__navigation__button__style'}
            iconSize={20}
            iconPath={mdiChevronRightBoxOutline}
            variant={'icon'}
            onClick={() => navigateResults('next')}
          />
        </SearchNavigationContainer>
        <LocalSearchContainer>
          <LocalSearchIcon>
            <Icon size={16} path={mdiMagnify} />
          </LocalSearchIcon>
          <textarea
            className={cc([hidingInput && 'search__input__hidden'])}
            onClick={focusSearchTextAreaInput}
            rows={1}
            value={searchQuery}
            // onInput={updateSearchValue}
            onChange={updateSearchValue}
            // onChange={() => undefined}
            onKeyDown={handleSearchInputKeyDown}
            wrap={'off'}
            ref={searchTextAreaRef}
          />
        </LocalSearchContainer>
        <SendButtonContainer>
          <Button
            className={cc([
              'in__page__search__done__button__width',
              hidingInput && 'search__input__hidden',
            ])}
            type={'button'}
            variant={'primary'}
            onClick={() => closeSearch()}
          >
            Done
          </Button>
        </SendButtonContainer>
      </SearchContainer>
    </InPageSearchPortal>
  )
}

const SearchNavigationContainer = styled.div`
  .search__navigation__button__style {
    padding: 0 !important;
    margin: 0;
    border: 0 none;
    border-radius: 2px;
  }
`

const LocalSearchIcon = styled.div`
  display: flex;
  align-items: center;

  padding-left: 6px;
`

const LocalSearchContainer = styled.div`
  display: flex;
  margin: 6px;
  width: 180px;

  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.variants.info.base};
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.text.primary};

  textarea {
    flex: 1;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: transparent;
    resize: none;
    height: 22px;

    overflow: hidden;
  }

  .search__input__hidden {
    visibility: hidden;
  }
`

export const SearchContainer = styled.div`
  display: flex;
  flex: 1 auto;
  padding-left: 6px;
  padding-right: 6px;

  border-radius: 2px;

  align-items: center;

  .search__component__hidden {
    visibility: hidden;
  }
`

export const SendButtonContainer = styled.div`
  display: flex;
  align-items: center;

  .in__page__search__done__button__width {
    width: 55px;
    height: 22px;
  }

  .search__input__hidden {
    visibility: hidden;
  }
`
const NumberOfMatchesContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;

  display: flex;
  align-items: center;

  padding-right: 5px;
`

export const InPageSearchContainer = styled.div`
  position: fixed;
  right: 377px;
  top: 56px;
  flex-grow: 1;
  z-index: 7999;

  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.background.tertiary};
`

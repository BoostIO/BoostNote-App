import React, { useState, useCallback, useMemo, useEffect } from 'react'
import styled from '../../../lib/styled'
import { baseIconStyle, inputStyle } from '../../../lib/styled/styleFunctions'
import { useDebounce } from 'react-use'
import { Spinner } from '../../atoms/Spinner'
import { MetaKeyText } from '../../../lib/keyboard'
import cc from 'classcat'
import {
  getSearchResults,
  SearchResult,
  GetSearchResultsRequestQuery,
} from '../../../api/search'
import { usePage } from '../../../lib/stores/pageStore'
import SuggestionItem from './SuggestionItem'
import { useSearch } from '../../../lib/stores/search'
import { useNav } from '../../../lib/stores/nav'
import {
  useUpDownNavigationListener,
  isSingleKeyEvent,
} from '../../../lib/keyboard'
import SearchHistoryItem from './SearchHistoryItem'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import { InputableDomElement } from '../../../lib/dom'
import IconMdi from '../../atoms/IconMdi'
import { mdiMagnify } from '@mdi/js'
import Flexbox from '../../atoms/Flexbox'

interface ModalSearchbarProps {
  className?: string
}

const ModalSearchbar = ({ className }: ModalSearchbarProps) => {
  const { team } = usePage()
  const [query, setQuery] = useState<string>('')
  const [focused, setFocused] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const {
    history,
    searchHistory,
    showGlobalSearch,
    setShowGlobalSearch,
    addToSearchHistory,
  } = useSearch()
  const { docsMap, foldersMap } = useNav()
  const inputRef = React.createRef<HTMLInputElement>()
  const [cursorPosition, setCursorPosition] = useState<number>(-1)
  const wrapperRef = React.createRef<HTMLDivElement>()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEvent(event, 'escape') && (showGlobalSearch || focused)) {
        ;(document.activeElement as InputableDomElement).blur()
      }
    }
  }, [focused, showGlobalSearch])
  useGlobalKeyDownHandler(keydownHandler)

  useEffect(() => {
    if (showGlobalSearch === true) {
      try {
        inputRef!.current!.focus()
      } catch (error) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGlobalSearch])

  const onQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setReady(true)
      setQuery(event.target.value)
    },
    [setQuery]
  )

  const setQueryAndReadyUp = useCallback(
    (val: string) => {
      setReady(true)
      setQuery(val)
    },
    [setQuery]
  )

  const [isNotDebouncing, cancel] = useDebounce(
    async () => {
      if (team == null || query.trim() === '') {
        return
      }

      if (ready) {
        setFetching(true)
        try {
          const searchParams = query
            .split(' ')
            .reduce<GetSearchResultsRequestQuery>(
              (params, str) => {
                if (str === '--body') {
                  params.body = true
                  return params
                }
                if (str === '--title') {
                  params.title = true
                  return params
                }
                params.query =
                  params.query == '' ? str : `${params.query} ${str}`
                return params
              },
              { query: '' }
            )

          addToSearchHistory(searchParams.query)
          const { results } = await getSearchResults(team, searchParams)
          setSuggestions(results)
        } catch (error) {}
        setFetching(false)
      } else {
        cancel()
      }
    },
    600,
    [query]
  )

  const recentPages: SearchResult[] = useMemo(() => {
    try {
      return history
        .map((historyItem) => {
          if (historyItem.type === 'doc') {
            if (docsMap.has(historyItem.item)) {
              return {
                type: 'doc',
                result: docsMap.get(historyItem.item)!,
              } as SearchResult
            }
          } else if (historyItem.type === 'folder') {
            if (foldersMap.has(historyItem.item)) {
              return {
                type: 'folder',
                result: foldersMap.get(historyItem.item)!,
              } as SearchResult
            }
          }
          return null
        })
        .filter((item) => item != null) as SearchResult[]
    } catch (error) {
      return []
    }
  }, [docsMap, history, foldersMap])

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      wrapperRef.current == null ||
      !wrapperRef.current.contains(event.relatedTarget)
    ) {
      setFocused(false)
      setShowGlobalSearch(false)
      return
    }
  }

  const listItemLength = useMemo(() => {
    if (query.trim() === '') {
      return recentPages.length
    }
    if (suggestions.length === 0 && !fetching) {
      return 0
    }
    return suggestions.length
  }, [fetching, query, recentPages.length, suggestions.length])

  useEffect(() => {
    setCursorPosition(-1)
  }, [listItemLength])

  useEffect(() => {
    if (focused && cursorPosition === -1 && inputRef.current != null) {
      inputRef.current.focus()
    }
  }, [cursorPosition, inputRef, focused])

  useUpDownNavigationListener(wrapperRef, { overrideInput: true })

  const suggestionsList = useMemo(() => {
    if (team == null) {
      return null
    }

    const folders: SearchResult[] = []
    const docs: SearchResult[] = []

    suggestions.forEach((suggestion) => {
      if (suggestion.type === 'folder') {
        folders.push(suggestion)
      } else {
        docs.push(suggestion)
      }
    })

    return (
      <SuggestionsList>
        <SuggestionsScrollable>
          <Flexbox alignItems='flex-start'>
            <SearchSuggestionsLeft>
              <SuggestionHeader>Documents</SuggestionHeader>
              <SearchResultItem>
                {docs.length > 0 &&
                  docs.map((suggestion, index) => (
                    <SuggestionItem
                      team={team}
                      item={suggestion}
                      key={`${suggestion.type}-${suggestion.result.id}`}
                      id={`search-item-res-${index}`}
                    />
                  ))}
              </SearchResultItem>
            </SearchSuggestionsLeft>
            <SearchSuggestionsRight>
              <SuggestionHeader>Folders</SuggestionHeader>
              <SearchResultItem>
                {folders.length > 0 &&
                  folders.map((suggestion, index) => (
                    <SuggestionItem
                      team={team}
                      item={suggestion}
                      key={`${suggestion.type}-${suggestion.result.id}`}
                      id={`search-item-res-${index}`}
                    />
                  ))}
              </SearchResultItem>
            </SearchSuggestionsRight>
          </Flexbox>
        </SuggestionsScrollable>
      </SuggestionsList>
    )
  }, [suggestions, team])

  if (team == null) {
    return null
  }

  return (
    <SearchBarWrapperStyle
      className={cc(['searchbar', className, focused && 'focused'])}
      onBlur={onBlurHandler}
      tabIndex={-1}
      ref={wrapperRef}
    >
      <SearchInputWrapper>
        <IconMdi path={mdiMagnify} />
        <SearchInputStyle
          className='input'
          type='text'
          value={query}
          onChange={onQueryChange}
          placeholder='Search'
          ref={inputRef}
          onFocus={() => setFocused(true)}
        />
        {!focused && (
          <StyledSearchShortcut>{`${MetaKeyText()} P`}</StyledSearchShortcut>
        )}
      </SearchInputWrapper>
      <SearchSuggestionsWrapper className='suggestions'>
        {query.trim() === '' && (
          <SuggestionsList>
            <SuggestionsScrollable>
              <Flexbox alignItems='flex-start'>
                <SearchSuggestionsLeft>
                  <SuggestionHeader>Recently Visited</SuggestionHeader>
                  <SearchResultItem>
                    {recentPages.length > 0 &&
                      recentPages.map((page, index) => (
                        <SuggestionItem
                          team={team}
                          item={page}
                          key={page.result.id}
                          id={`search-item-recent-${index}`}
                        />
                      ))}
                  </SearchResultItem>
                </SearchSuggestionsLeft>
                <SearchSuggestionsRight>
                  <SuggestionHeader>Recent Keywords</SuggestionHeader>
                  <SearchResultItem>
                    {searchHistory != null &&
                      searchHistory.map((pastQuery, index) => (
                        <SearchHistoryItem
                          id={`search-item-history-${index}`}
                          pastQuery={pastQuery}
                          setCurrentQuery={setQueryAndReadyUp}
                          key={`search-item-history-${index}`}
                        />
                      ))}
                  </SearchResultItem>
                </SearchSuggestionsRight>
              </Flexbox>
            </SuggestionsScrollable>
          </SuggestionsList>
        )}

        {query.trim() !== '' && (fetching || !isNotDebouncing()) && (
          <StyledNoResults>
            {fetching ? (
              <Spinner
                style={{
                  position: 'absolute',
                  right: 0,
                  left: 0,
                  margin: 'auto',
                  bottom: 0,
                  top: 0,
                }}
              />
            ) : (
              <span>..</span>
            )}
          </StyledNoResults>
        )}

        {query.trim() !== '' &&
          suggestions.length === 0 &&
          !fetching &&
          isNotDebouncing() && (
            <StyledNoResults>
              <strong>No results</strong>
              <span>Try a different query.</span>
            </StyledNoResults>
          )}

        {query.trim() !== '' &&
          suggestions.length > 0 &&
          !fetching &&
          isNotDebouncing() && <>{suggestionsList}</>}
      </SearchSuggestionsWrapper>
    </SearchBarWrapperStyle>
  )
}

export default ModalSearchbar

const SearchBarWrapperStyle = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  right: 0;
  z-index: 9999 !important;
  width: 100%;
  max-width: 920px;

  .suggestions {
    display: none;
  }

  &.always-suggestions .suggestions,
  &.not-empty .suggestions,
  &.focused .suggestions {
    display: block !important;
  }

  &.in-page {
    margin: 0;
    width: 100%;

    > div:not(.suggestions) {
      ${inputStyle}
      overflow: hidden;
    }

    .prepend,
    .clear,
    .input {
      background: none !important;
    }
  }
`

const SearchInputWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  padding-top: ${({ theme }) => theme.space.xsmall}px;
  padding-bottom: ${({ theme }) => theme.space.xsmall}px;
  background-color: ${({ theme }) => theme.subtleBackgroundColor};
  border-radius: 5px 5px 0 0;

  svg {
    margin-left: ${({ theme }) => theme.space.small}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
  }
`

const StyledSearchShortcut = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.space.default}px;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.default}px;
`

const SearchInputStyle = styled.input`
  ${inputStyle}
  flex: 1 1 auto;
  padding-left: ${({ theme }) => theme.space.xsmall}px;
  padding-right: ${({ theme }) => theme.space.xlarge}px;
  height: 40px;
  opacity: 1;
  outline: 0 !important;
  box-shadow: none !important;
  font-size: ${({ theme }) => theme.fontSizes.medium}px;
  &:focus {
    box-shadow: none !important;
  }
`

const StyledNoResults = styled.div`
  width: 100%;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  padding: ${({ theme }) => theme.space.small}px 0;
  position: relative;
  strong {
    display: block;
  }
`
const SearchSuggestionsWrapper = styled.div`
  position: absolute;
  top: 100%;
  width: 100%;
  height: auto;
  z-index: 120;
  background: ${({ theme }) => theme.subtleBackgroundColor};
  border: 2px solid ${({ theme }) => theme.subtleBackgroundColor};
  border-radius: 0 0 5px 5px;

  &:hover {
    display: block;
  }
`

const SearchResultItem = styled.div`
  color: ${({ theme }) => theme.emphasizedTextColor} !important;

  .searchResult {
    min-height: 34px !important;
    height: auto !important;
    justify-content: flex-start !important;
    padding: 0;

    &:hover,
    &.focused {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }
  }

  .itemLink {
    padding: ${({ theme }) => theme.space.xsmall}px 4%;
    text-decoration: none;
    display: block;
    width: 100%;

    &:hover {
      color: ${({ theme }) => theme.emphasizedIconColor};
    }

    svg {
      ${baseIconStyle}
    }
  }

  .label {
    font-size: ${({ theme }) => theme.fontSizes.default}px !important;
  }
`

const SuggestionsList = styled.div`
  height: 100%;
  max-height: calc(100vh - ${({ theme }) => theme.topHeaderHeight * 4}px);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  display: flex;
  flex-direction: column;
  position: relative;
`

const SuggestionHeader = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.space.small}px;
  border-top: 1px solid ${({ theme }) => theme.baseBorderColor};
  color: ${({ theme }) => theme.subtleTextColor};
  font-weight: bold;
  text-transform: uppercase;
`

const SuggestionsScrollable = styled.div`
  flex: 1 1 auto;
  overflow: hidden auto;
  display: block;
  padding-bottom: ${({ theme }) => theme.space.small}px;
`

const SearchSuggestionsLeft = styled.div`
  width: 70%;
`

const SearchSuggestionsRight = styled.div`
  width: 30%;
`

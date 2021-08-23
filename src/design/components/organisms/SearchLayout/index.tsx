import React, { useMemo, useRef } from 'react'
import { useEffectOnce, useSet } from 'react-use'
import cc from 'classcat'
import UpDownList from '../../atoms/UpDownList'
import SearchCategory from './molecules/SearchCategory'
import SearchItem from './atoms/SearchItem'
import CloseButtonWrapper from '../../molecules/CloseButtonWrapper'
import styled from '../../../lib/styled'
import plur from 'plur'
import Spinner from '../../atoms/Spinner'
import { overflowEllipsis } from '../../../lib/styled/styleFunctions'
import FormInput from '../../molecules/Form/atoms/FormInput'
import { mdiMagnify } from '@mdi/js'
import Icon from '../../atoms/Icon'
import VerticalScroller from '../../atoms/VerticalScroller'

interface SearchLayoutProps {
  searchPlaceholder: string
  searchQuery: string
  setSearchQuery: (val: string) => void
  className?: string
  recentlyVisited?: GlobalSearchHistory[]
  recentlySearched?: string[]
  searchResults?: GlobalSearchResult[]
  searchState: GlobalSearchState
  closeSearch: () => void
}

export type GlobalSearchState = { isNotDebouncing: boolean; fetching: boolean }

export type GlobalSearchResult = {
  label: string
  href: string
  contexts?: React.ReactNode[]
  onClick: () => void
  emoji?: string
  defaultIcon?: string
}

export type GlobalSearchHistory = {
  emoji?: string
  defaultIcon?: string
  path?: string
  label: string
  href: string
  onClick: () => void
}

const SearchLayout = ({
  searchPlaceholder,
  searchResults = [],
  searchQuery,
  setSearchQuery,
  className,
  recentlySearched = [],
  recentlyVisited = [],
  searchState: { isNotDebouncing, fetching },
  closeSearch,
}: SearchLayoutProps) => {
  const [, { has, add, remove, toggle }] = useSet<string>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    inputRef.current?.focus()
  })

  const results = useMemo(() => {
    return searchResults.reduce(
      (acc, val) => {
        const labelMatch = val.label
          .toLocaleLowerCase()
          .includes(searchQuery.toLocaleLowerCase())
        if (labelMatch && val.contexts == null) {
          acc.items.push(val)
        } else if (val.contexts != null) {
          acc.contextItems.push(val)
        } else {
          acc.similar.push(val)
        }
        return acc
      },
      {
        items: [],
        contextItems: [],
        similar: [],
      } as {
        items: GlobalSearchResult[]
        contextItems: GlobalSearchResult[]
        similar: GlobalSearchResult[]
      }
    )
  }, [searchResults, searchQuery])

  return (
    <Container className={cc(['sidebar__search', className])}>
      <UpDownList className='sidebar__search__wrapper'>
        <div className='sidebar__search__header'>
          <CloseButtonWrapper
            onClick={() => setSearchQuery('')}
            show={searchQuery !== ''}
            className='sidebar__search__input__wrapper'
          >
            <Icon
              path={mdiMagnify}
              size={16}
              className='sidebar__search__icon'
            />
            <FormInput
              className='sidebar__search__input'
              placeholder={searchPlaceholder}
              id='sidebar__search__input'
              value={searchQuery}
              onChange={(ev) => setSearchQuery(ev.target.value)}
              ref={inputRef}
            />
          </CloseButtonWrapper>
        </div>
        <VerticalScroller className='sidebar__search__results'>
          <div className='sidebar__search__results__wrapper'>
            {searchQuery.trim() === '' && (
              <>
                {recentlySearched.length > 0 && (
                  <>
                    <SearchCategory
                      id='sidebar__search__keywords'
                      folded={has('keywords')}
                      unfold={() => remove('keywords')}
                      fold={() => add('keywords')}
                      toggle={() => toggle('keywords')}
                      className='sidebar__search__category'
                    >
                      Recently Searched
                    </SearchCategory>
                    {!has('keywords') &&
                      recentlySearched.map((keyword) => (
                        <SearchItem
                          label={keyword}
                          defaultIcon={mdiMagnify}
                          labelClick={() => setSearchQuery(keyword)}
                          key={`recently-searched-${keyword}`}
                          id={`recently-searched-${keyword}`}
                        />
                      ))}
                  </>
                )}
                {recentlyVisited.length > 0 && (
                  <>
                    <SearchCategory
                      id='sidebar__search__history'
                      folded={has('history')}
                      unfold={() => remove('history')}
                      fold={() => add('history')}
                      toggle={() => toggle('history')}
                      className='sidebar__search__category'
                    >
                      Recently Visited
                    </SearchCategory>
                    {!has('history') &&
                      recentlyVisited.map((item, i) => (
                        <SearchItem
                          label={item.label}
                          labelHref={item.href}
                          path={item.path}
                          labelClick={() => {
                            item.onClick()
                            closeSearch()
                          }}
                          defaultIcon={item.defaultIcon}
                          emoji={item.emoji}
                          key={`recently-visited-${i}`}
                          id={`recently-visited-${i}`}
                        />
                      ))}
                  </>
                )}
              </>
            )}

            {searchQuery.trim() !== '' && (fetching || !isNotDebouncing) && (
              <>
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
                  <div className='sidebar__search__empty'>..</div>
                )}
              </>
            )}

            {searchQuery.trim() !== '' &&
              searchResults.length === 0 &&
              !fetching &&
              isNotDebouncing && (
                <>
                  <strong className='sidebar__search__empty'>No results</strong>
                  <div className='sidebar__search__empty'>
                    Try a different query.
                  </div>
                </>
              )}

            {searchQuery.trim() !== '' &&
              searchResults.length > 0 &&
              !fetching &&
              isNotDebouncing && (
                <>
                  {results.items.length + results.contextItems.length === 0 ? (
                    <>
                      <strong className='sidebar__search__empty'>
                        No matches
                      </strong>
                      <div className='sidebar__search__empty'>
                        Try a different query.
                      </div>
                    </>
                  ) : (
                    <>
                      {results.items.length === 0 ? null : (
                        <>
                          <SearchCategory
                            id='sidebar__search__matches'
                            folded={has('matches')}
                            unfold={() => remove('matches')}
                            fold={() => add('matches')}
                            toggle={() => toggle('matches')}
                            className='sidebar__search__category'
                          >
                            {results.items.length}{' '}
                            {plur('item', results.items.length)}
                          </SearchCategory>
                          {!has('matches') &&
                            results.items.map((result, i) => (
                              <SearchItem
                                id={`sidebar__result--matches__${i}`}
                                key={`sidebar__result--matches__${i}`}
                                label={result.label}
                                labelHref={result.href}
                                labelClick={() => {
                                  result.onClick()
                                  closeSearch()
                                }}
                                emoji={result.emoji}
                                defaultIcon={result.defaultIcon}
                                highlighted={searchQuery}
                              />
                            ))}
                        </>
                      )}

                      {results.contextItems.length === 0 ? null : (
                        <>
                          <SearchCategory
                            id='sidebar__search__context__matches'
                            folded={has('context__matches')}
                            unfold={() => remove('context__matches')}
                            fold={() => add('context__matches')}
                            toggle={() => toggle('context__matches')}
                            className='sidebar__search__category'
                          >
                            Found in {results.contextItems.length}{' '}
                            {plur('item', results.contextItems.length)}
                          </SearchCategory>
                          {!has('context__matches') &&
                            results.contextItems.map((result, i) => (
                              <SearchItem
                                id={`sidebar__result__${i}`}
                                key={`sidebar__result__${i}`}
                                label={result.label}
                                labelHref={result.href}
                                labelClick={() => {
                                  result.onClick()
                                  closeSearch()
                                }}
                                contexts={result.contexts}
                                emoji={result.emoji}
                                defaultIcon={result.defaultIcon}
                                highlighted={searchQuery}
                                folded={
                                  result.contexts != null
                                    ? has(`${result.label}-${i}`)
                                    : undefined
                                }
                                folding={
                                  result.contexts != null
                                    ? {
                                        unfold: () =>
                                          remove(`${result.label}-${i}`),
                                        fold: () => add(`${result.label}-${i}`),
                                        toggle: () =>
                                          toggle(`${result.label}-${i}`),
                                      }
                                    : undefined
                                }
                              />
                            ))}
                        </>
                      )}
                    </>
                  )}

                  {results.similar.length === 0 ? null : (
                    <>
                      <SearchCategory
                        id='sidebar__search__similarities'
                        folded={has('similarities')}
                        unfold={() => remove('similarities')}
                        fold={() => add('similarities')}
                        toggle={() => toggle('similarities')}
                        className='sidebar__search__category'
                      >
                        {results.similar.length} Similar{' '}
                        {plur('result', results.similar.length)}
                      </SearchCategory>
                      {!has('similarities') &&
                        results.similar.map((result, i) => (
                          <SearchItem
                            id={`sidebar__result--similar__${i}`}
                            key={`sidebar__result--similar__${i}`}
                            label={result.label}
                            labelHref={result.href}
                            labelClick={() => {
                              result.onClick()
                              closeSearch()
                            }}
                            emoji={result.emoji}
                            defaultIcon={result.defaultIcon}
                            highlighted={searchQuery}
                          />
                        ))}
                    </>
                  )}
                </>
              )}
          </div>
        </VerticalScroller>
      </UpDownList>
    </Container>
  )
}

const Container = styled.div`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  height: 100vh;

  .search__category + .search__category,
  .search__item + .search__category {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .sidebar__search__header {
    flex: 0 0 auto;
  }

  .sidebar__search__input__wrapper {
    width: 100%;
    position: relative;
    flex: 0 0 auto;
    input {
      border-top: 0 !important;
      border-left: 0 !important;
      border-right: 0 !important;
      border-radus: 0 !important;
      height: 43px;
      padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
    }

    .sidebar__search__icon {
      position: absolute;
      left: 10px;
    }
  }

  .sidebar__search__results {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow: auto;
    flex: 1 1 auto;
    padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
  }

  .sidebar__search__results__wrapper {
    flex: 1 1 auto;
    width: 100%;
    max-width: 1200px;
    margin: auto;
  }

  .sidebar__search__empty {
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .sidebar__search__wrapper {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar__search__category {
    display: flex;
    justify-content: flex-start;
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    white-space: nowrap;
    text-align: left;

    .button__label {
      ${overflowEllipsis}
    }
  }

  .sidebar__search__empty + .sidebar__search__category,
  .sidebar__search__item + .sidebar__search__category {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .sidebar__search__item {
    margin: 0 !important;
  }
`

export default SearchLayout

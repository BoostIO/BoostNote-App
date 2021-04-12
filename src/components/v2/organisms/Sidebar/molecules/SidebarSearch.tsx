import React from 'react'
import styled from '../../../../../lib/v2/styled'
import FormInput from '../../../molecules/Form/atoms/FormInput'
import SidebarHeader from '../atoms/SidebarHeader'
import cc from 'classcat'
import { useSet } from 'react-use'
import SidebarSearchCategory from '../atoms/SidebarSearchCategory'
import SidebarSearchItem from '../atoms/SidebarSearchItem'
import SidebarContextList from '../atoms/SidebarContextList'
import Spinner from '../../../atoms/Spinner'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'

interface SidebarSearchProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  className?: string
  sending?: boolean
  recentlyVisited?: SidebarSearchHistory[]
  recentlySearched?: string[]
  searchResults?: SidebarSearchResult[]
  searchState: SidebarSearchState
}

export type SidebarSearchState = { isNotDebouncing: boolean; fetching: boolean }

export type SidebarSearchResult = {
  label: string
  href: string
  contexts?: string[]
  onClick: () => void
  emoji?: string
  defaultIcon?: string
}

export type SidebarSearchHistory = {
  emoji?: string
  defaultIcon?: string
  label: string
  href: string
  onClick: () => void
}

const SidebarSearch = ({
  className,
  searchQuery,
  setSearchQuery,
  recentlySearched = [],
  recentlyVisited = [],
  searchState: { isNotDebouncing, fetching },
  searchResults = [],
}: SidebarSearchProps) => {
  const [, { has, add, remove, toggle }] = useSet<string>(new Set())

  return (
    <Container className={cc(['sidebar__search', className])}>
      <SidebarHeader label='Search' />
      <SidebarContextList className='sidebar__search__wrapper'>
        <FormInput
          className='sidebar__search__input'
          placeholder='Search'
          id='sidebar__search__input'
          value={searchQuery}
          onChange={(ev) => setSearchQuery(ev.target.value)}
        />
        <div className='sidebar__search__results'>
          {searchQuery.trim() === '' && (
            <>
              {recentlyVisited.length > 0 && (
                <>
                  <SidebarSearchCategory
                    id='sidebar__search__history'
                    folded={has('history')}
                    unfold={() => remove('history')}
                    fold={() => add('history')}
                    toggle={() => toggle('history')}
                    className='sidebar__search__category'
                  >
                    Recently Visited
                  </SidebarSearchCategory>
                  {!has('history') &&
                    recentlyVisited.map((item, i) => (
                      <SidebarSearchItem
                        label={item.label}
                        labelHref={item.href}
                        labelClick={item.onClick}
                        defaultIcon={item.defaultIcon}
                        emoji={item.emoji}
                        key={`recently-visited-${i}`}
                        id={`recently-visited-${i}`}
                      />
                    ))}
                </>
              )}
              {recentlySearched.length > 0 && (
                <>
                  <SidebarSearchCategory
                    id='sidebar__search__keywords'
                    folded={has('keywords')}
                    unfold={() => remove('keywords')}
                    fold={() => add('keywords')}
                    toggle={() => toggle('keywords')}
                    className='sidebar__search__category'
                  >
                    Recent Keywords
                  </SidebarSearchCategory>
                  {!has('keywords') &&
                    recentlySearched.map((keyword) => (
                      <SidebarSearchItem
                        label={keyword}
                        labelClick={() => setSearchQuery(keyword)}
                        key={`recently-searched-${keyword}`}
                        id={`recently-searched-${keyword}`}
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
                {searchResults.map((result, i) => (
                  <SidebarSearchItem
                    id={`sidebar__result__${i}`}
                    key={`sidebar__result__${i}`}
                    label={result.label}
                    labelHref={result.href}
                    labelClick={result.onClick}
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
                            unfold: () => remove(`${result.label}-${i}`),
                            fold: () => add(`${result.label}-${i}`),
                            toggle: () => toggle(`${result.label}-${i}`),
                          }
                        : undefined
                    }
                  />
                ))}
              </>
            )}
        </div>
      </SidebarContextList>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar__search__input {
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    flex: 0 0 auto;
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

  .sidebar__search__empty {
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .sidebar__search__wrapper {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar__search__category {
    justify-content: flex-start;
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    white-space: nowrap;
    text-align: left;

    .button__label {
      ${overflowEllipsis}
    }
  }

  .sidebar__search__item {
    margin: 0 !important;
  }
`

export default SidebarSearch

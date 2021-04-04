import React, { useState } from 'react'
import styled from '../../../../../lib/v2/styled'
import FormInput from '../../../molecules/Form/atoms/FormInput'
import SidebarHeader from '../atoms/SidebarHeader'
import cc from 'classcat'
import UpDownList from '../../../atoms/UpDownList'
import { useSet } from 'react-use'
import SidebarSearchCategory from '../atoms/SidebarSearchCategory'
import SidebarSearchItem from '../atoms/SidebarSearchItem'

interface SidebarSearchProps {
  className?: string
  sending?: boolean
  recentlyVisited?: SidebarSearchHistory[]
  recentlySearched?: string[]
  searchResults?: SidebarSearchResult[]
}

export type SidebarSearchResult = {
  label: string
  href: string
  contexts?: string[]
  onClick: () => void
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
  recentlySearched = [],
  recentlyVisited = [],
}: SidebarSearchProps) => {
  const [query, setQuery] = useState<string>('')
  const [foldedItems, { has, add, remove, toggle }] = useSet<string>(new Set())

  return (
    <Container className={cc(['sidebar__search', className])}>
      <SidebarHeader label='Search' />
      <UpDownList className='sidebar__search__wrapper'>
        <FormInput
          className='sidebar__search__input'
          placeholder='Search'
          id='sidebar__search__input'
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        />
        {recentlyVisited.length > 0 && (
          <>
            <SidebarSearchCategory
              id='sidebar__search__history'
              folded={!has('history')}
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
                  labelClick={() => setQuery(keyword)}
                  key={`recently-searched-${keyword}`}
                  id={`recently-searched-${keyword}`}
                />
              ))}
          </>
        )}
      </UpDownList>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar__search__input {
    margin: 0px ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.df}px;
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
  }

  .sidebar__search__item {
    margin: 0 !important;
  }
`

export default SidebarSearch

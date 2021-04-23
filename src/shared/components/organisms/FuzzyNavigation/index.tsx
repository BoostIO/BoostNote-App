import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { useGlobalKeyDownHandler } from '../../../lib/keyboard'
import styled from '../../../lib/styled'
import UpDownList from '../../atoms/UpDownList'
import FormInput from '../../molecules/Form/atoms/FormInput'
import FuzzyNavigationitem, {
  FuzzyNavigationItemAttrbs,
} from './molecules/FuzzyNavigationItem'
import { distance } from 'fastest-levenshtein'
import { sortArrayByIntProperty } from '../../../lib/utils/array'

interface FuzzyNavigationProps {
  recentItems: FuzzyNavigationItemAttrbs[]
  allItems: FuzzyNavigationItemAttrbs[]
  close: () => void
}

const FuzzyNavigation = ({
  allItems,
  recentItems = [],
  close,
}: FuzzyNavigationProps) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape') {
        close()
      }
    },
    [close]
  )
  useGlobalKeyDownHandler(keydownHandler)

  const filteredItems = useMemo(() => {
    if (query === '') return []

    const items = sortArrayByIntProperty(
      allItems.map((item) => {
        return {
          ...item,
          distance: distance(query, item.label),
        }
      }),
      'distance'
    )

    return items
  }, [allItems, query])

  return (
    <Container className='fuzzy'>
      <div className='fuzzy__background' onClick={() => close()} />
      <UpDownList className='fuzzy__wrapper'>
        <FormInput
          id='fuzzy__search__input'
          className='fuzzy__search'
          placeholder='Search'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
        />
        {query === '' ? (
          <>
            <span className='fuzzy__label'>
              {recentItems.length === 0
                ? `No recently visited items`
                : `Recent items`}
            </span>
            {recentItems.map((item, i) => (
              <FuzzyNavigationitem
                item={item}
                id={`fuzzy-recent-${i}`}
                key={`fuzzy-recent-${i}`}
              />
            ))}
          </>
        ) : (
          <>
            {filteredItems.length === 0 && (
              <span className='fuzzy__label'>No matching results</span>
            )}
            {filteredItems.map((item, i) => (
              <FuzzyNavigationitem
                item={item}
                id={`fuzzy-filtered-${i}`}
                key={`fuzzy-filtered-${i}`}
              />
            ))}
          </>
        )}
      </UpDownList>
    </Container>
  )
}

const Container = styled.div`
  .fuzzy__search {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    width: initial;
  }

  .fuzzy__wrapper {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    right: 0;
    z-index: 9999 !important;
    width: 96%;
    max-width: 920px;
    background: ${({ theme }) => theme.colors.background.primary};
    padding-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;

    display: flex;
    flex-direction: column;
  }

  .fuzzy__background {
    z-index: 8001;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000;
    opacity: 0.7;
  }

  .fuzzy__label {
    color: ${({ theme }) => theme.colors.text.subtle};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px
      ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default FuzzyNavigation

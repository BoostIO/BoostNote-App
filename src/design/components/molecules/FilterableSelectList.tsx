import React, { useState } from 'react'
import { useI18n } from '../../../cloud/lib/hooks/useI18n'
import { lngKeys } from '../../../cloud/lib/i18n/types'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
import VerticalScroller from '../atoms/VerticalScroller'
import FormInput from './Form/atoms/FormInput'
import FormRowItem from './Form/templates/FormRowItem'

interface FilterableSelectListProps {
  items: [string, React.ReactNode][]
}

const FilterableSelectList: AppComponent<FilterableSelectListProps> = ({
  items,
  className,
}) => {
  const [filter, setFilter] = useState('')
  const { translate } = useI18n()

  return (
    <Container className={className}>
      <FormRowItem>
        <FormInput
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={translate(lngKeys.GeneralSearchVerb)}
          id='selection__input'
        />
      </FormRowItem>
      <VerticalScroller>
        <ul>
          {items
            .filter(([key]) => key.includes(filter))
            .map(([key, node]) => {
              return <li key={key}>{node}</li>
            })}
        </ul>
      </VerticalScroller>
    </Container>
  )
}

export default FilterableSelectList

const Container = styled.div`
  & ul {
    margin: 0;
    padding: 0;
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    list-style: none;
    & > li {
      padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
      align-items: center;

      &:first-child {
        border-top: 1px solid ${({ theme }) => theme.colors.border.second};
      }
    }
  }
`

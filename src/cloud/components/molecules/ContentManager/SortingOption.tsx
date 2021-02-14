import React from 'react'
import CustomSelect, {
  CustomSelectOption,
} from '../../atoms/Select/CustomSelect'
import Flexbox from '../../atoms/Flexbox'
import IconMdi from '../../atoms/IconMdi'
import {
  mdiSortClockAscending,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
} from '@mdi/js'
import styled from '../../../lib/styled'

export const sortingOrders: CustomSelectOption[] = [
  {
    label: (
      <Flexbox>
        <IconMdi path={mdiSortClockAscending} size={20} />{' '}
        <span className='label'>Latest Updated</span>
      </Flexbox>
    ),
    value: 'Latest Updated',
    data: 'Latest Updated',
  },
  {
    label: (
      <Flexbox>
        <IconMdi path={mdiSortAlphabeticalAscending} size={20} />{' '}
        <span className='label'>Title A-Z</span>
      </Flexbox>
    ),
    value: 'Title A-Z',
    data: 'Title A-Z',
  },
  {
    label: (
      <Flexbox>
        <IconMdi path={mdiSortAlphabeticalDescending} size={20} />{' '}
        <span className='label'>Title Z-A</span>
      </Flexbox>
    ),
    value: 'Title Z-A',
    data: 'Title Z-A',
  },
]

interface SortingOptionProps {
  value: typeof sortingOrders[number]['data']
  onChange: (value: CustomSelectOption) => void
}

const SortingOption = ({ value, onChange }: SortingOptionProps) => {
  return (
    <StyledSortingOption>
      <CustomSelect
        options={sortingOrders}
        value={sortingOrders.find((ORDER) => ORDER.data === value)}
        onChange={onChange}
        className='rc-select'
        classNamePrefix='select'
        isSearchable={false}
        isMulti={false}
      />
    </StyledSortingOption>
  )
}

const StyledSortingOption = styled.div`
  margin-left: ${({ theme }) => theme.space.small}px;

  .rc-select {
    font-size: ${({ theme }) => theme.fontSizes.small}px;

    svg {
      margin-right: ${({ theme }) => theme.space.xsmall}px;
    }
  }

  .select__control {
    flex-wrap: inherit;
    width: 52px;
    min-height: 32px;
    height: 34px;
    border: 0 !important;
    box-shadow: none !important;
    background-color: transparent;
    cursor: pointer;

    .select__single-value,
    .select__dropdown-indicator {
      color: ${({ theme }) => theme.baseTextColor} !important;
      transition: color 150ms;

      .label {
        display: none;
      }
    }

    .select__value-container,
    .select__dropdown-indicator {
      padding: 2px;

      svg {
        margin-right: 0;
      }
    }

    &:hover {
      .select__single-value,
      .select__dropdown-indicator {
        color: ${({ theme }) => theme.emphasizedTextColor} !important;
      }
    }
  }

  .select__menu {
    right: 0;
    width: 180px;
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    box-shadow: ${({ theme }) => theme.baseShadowColor};
  }
  .select__option:hover {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }
`

export default SortingOption

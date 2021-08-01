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
import styled from '../../../../shared/lib/styled'
import { menuHeight } from '../../../../shared/lib/stores/contextMenu'

export const sortingOrders: CustomSelectOption[] = [
  {
    label: (
      <Flexbox>
        <IconMdi
          path={mdiSortClockAscending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Latest Updated</span>
      </Flexbox>
    ),
    value: 'Latest Updated',
    data: 'Latest Updated',
  },
  {
    label: (
      <Flexbox>
        <IconMdi
          path={mdiSortAlphabeticalAscending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Title A-Z</span>
      </Flexbox>
    ),
    value: 'Title A-Z',
    data: 'Title A-Z',
  },
  {
    label: (
      <Flexbox>
        <IconMdi
          path={mdiSortAlphabeticalDescending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Title Z-A</span>
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
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;

  .select__control {
    flex-wrap: inherit;
    width: 32px;
    min-height: 32px;
    height: 34px;
    border: 0 !important;
    box-shadow: none !important;
    background-color: transparent;
    cursor: pointer;

    .select__single-value,
    .select__dropdown-indicator {
      color: ${({ theme }) => theme.colors.text.subtle} !important;
      transition: color 150ms;

      .select__option__icon {
        width: 20px !important;
        height: 20px !important;
      }

      .select__option__label {
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
        color: ${({ theme }) => theme.colors.text.secondary} !important;
      }
    }
  }

  .select__menu {
    right: 0;
    width: 180px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .select__indicators {
    display: none;
  }

  .select__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: ${menuHeight}px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
    background-color: transparent;
    border: none;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    text-align: left;
    transition: 200ms color;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
    &:focus,
    &--is-selected {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
    &:disabled {
      color: ${({ theme }) => theme.colors.text.subtle};
      &:hover,
      &:focus {
        color: ${({ theme }) => theme.colors.text.subtle};
        background-color: transparent;
        cursor: not-allowed;
      }
    }
  }

  .select__option__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default SortingOption

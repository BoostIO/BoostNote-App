import React from 'react'
import {
  mdiSortClockAscending,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
} from '@mdi/js'
import FormSelect, {
  FormSelectOption,
} from '../../../design/components/molecules/Form/atoms/FormSelect'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { menuHeight } from '../../../design/lib/stores/contextMenu'

export const sortingOrders: (FormSelectOption & { icon: React.ReactNode })[] = [
  {
    label: (
      <Flexbox>
        <Icon
          path={mdiSortClockAscending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Latest Updated</span>
      </Flexbox>
    ),
    icon: (
      <Icon
        path={mdiSortClockAscending}
        size={20}
        className='select__option__icon'
      />
    ),
    value: 'Latest Updated',
  },
  {
    label: (
      <Flexbox>
        <Icon
          path={mdiSortAlphabeticalAscending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Title A-Z</span>
      </Flexbox>
    ),
    icon: (
      <Icon
        path={mdiSortAlphabeticalAscending}
        size={20}
        className='select__option__icon'
      />
    ),
    value: 'Title A-Z',
  },
  {
    label: (
      <Flexbox>
        <Icon
          path={mdiSortAlphabeticalDescending}
          size={16}
          className='select__option__icon'
        />{' '}
        <span className='select__option__label'>Title Z-A</span>
      </Flexbox>
    ),
    icon: (
      <Icon
        path={mdiSortAlphabeticalDescending}
        size={20}
        className='select__option__icon'
      />
    ),
    value: 'Title Z-A',
  },
]

interface SortingOptionProps {
  value: typeof sortingOrders[number]['value']
  onChange: (value: FormSelectOption) => void
}

const SortingOption = ({ value, onChange }: SortingOptionProps) => {
  const val = sortingOrders.find((ORDER) => ORDER.value === value)
  return (
    <StyledSortingOption>
      <FormSelect
        options={sortingOrders}
        value={val != null ? { label: val.icon, value: val.value } : undefined}
        onChange={onChange}
        className='rc-select'
        isSearchable={false}
        isMulti={false}
      />
    </StyledSortingOption>
  )
}

const StyledSortingOption = styled.div`
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  .form__select__control {
    flex-wrap: inherit;
    min-width: 32px !important;
    width: 32px;
    min-height: 32px;
    height: 34px;
    border: 0 !important;
    box-shadow: none !important;
    background-color: transparent;
    cursor: pointer;
    .form__select__single-value,
    .form__select__dropdown-indicator {
      color: ${({ theme }) => theme.colors.text.subtle} !important;
      transition: color 150ms;
      .form__select__option__icon {
        width: 20px !important;
        height: 20px !important;
      }
      .form__select__option__label {
        display: none;
      }
    }
    .form__select__value-container,
    .form__select__dropdown-indicator {
      padding: 2px;
      svg {
        margin-right: 0;
      }
    }
    &:hover {
      .form__select__single-value,
      .form__select__dropdown-indicator {
        color: ${({ theme }) => theme.colors.text.secondary} !important;
      }
    }
  }
  .form__select__menu {
    right: 0;
    width: 180px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }
  .form__select__indicators {
    display: none;
  }
  .form__select__option {
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
  .form__select__option__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default SortingOption

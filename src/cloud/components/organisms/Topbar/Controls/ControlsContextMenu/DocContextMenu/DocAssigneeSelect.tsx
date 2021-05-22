import React, { useMemo, useCallback, useState } from 'react'
import { usePage } from '../../../../../../lib/stores/pageStore'
import { SerializedUser } from '../../../../../../interfaces/db/user'
import { FormSelectOption } from '../../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import styled from '../../../../../../../shared/lib/styled'
import UserIcon from '../../../../../atoms/UserIcon'
import Select from 'react-select'
import cc from 'classcat'
import { contextMenuFormItem } from '../../../../../../../shared/lib/styled/styleFunctions'

interface DocAssigneeSelectProps {
  disabled?: boolean
  defaultValue: string[]
  update: (value: string[]) => void
  isLoading: boolean
}

const DocAssigneeSelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  update,
}: DocAssigneeSelectProps) => {
  const { permissions } = usePage()
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState(defaultValue)

  const options = useMemo(() => {
    if (permissions == null) {
      return []
    }
    return permissions.map((permission) => {
      return getOptionByUser(permission.user)
    })
  }, [permissions])

  const selectedOptions = useMemo(() => {
    if (permissions == null) {
      return []
    }
    const userMap = permissions.reduce((map, permission) => {
      const { user } = permission
      map.set(user.id, user)
      return map
    }, new Map())

    return getSelectedOptionsByUserId(value, userMap)
  }, [permissions, value])

  const updateAssignees = useCallback(
    (selectedOptions: any) => {
      const value = (selectedOptions as FormSelectOption[]).map(
        (option) => option.value
      )
      setValue(value)
      update(value)
    },
    [update, setValue]
  )

  return (
    <SelectContainer>
      <Select
        isMulti
        className={cc([
          'form__select',
          focused && 'form__select--focused',
          disabled && 'form__select--disabled',
        ])}
        id='assignee-select'
        classNamePrefix='form__select'
        isDisabled={disabled}
        options={options}
        value={selectedOptions}
        isClearable={false}
        onChange={updateAssignees}
        placeholder={'Unassigned'}
        isLoading={isLoading}
        isSearchable={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </SelectContainer>
  )
}

const SelectContainer = styled.div`
  .assignee__item__icon {
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 18px;
    margin-right: 4px;
  }

  .form__select .form__select__indicator-separator {
    width: 0;
  }

  .form__select .form__select__dropdown-indicator {
    display: none;
  }

  .form__select .form__select__indicators {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .form__select .form__select__control,
  .form__select .form__select__value-container {
    height: 32px !important;
    min-height: 32px !important;
    background: none !important;
    border: 1px solid transparent !important;
  }

  .form__select .form__select__placeholder {
    color: ${({ theme }) => theme.colors.text.subtle};
    margin: 0;
  }

  .form__select .form__select__control {
    width: 100%;
    position: relative;
    &:hover,
    &.form__select__control--is-focused {
      .form__select__placeholder {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
    ${({ theme }) =>
      contextMenuFormItem({ theme }, '.form__select__control--is-focused')}
  }

  .form__select .form__select__value-container {
    align-items: flex-start !important;
    flex-wrap: wrap;
    padding: 0 !important;
    top: 0;
    left: 5px;
    position: absolute;
    width: 100%;
  }

  .form__select .form__select__multi-value {
    position: relative;
    height: 100%;
    background: none;
    margin: 0;
  }

  .form__select .form__select__multi-value__remove {
    height: auto;
    position: absolute;
    top: 2px;
    right: -9px;
    background: none !important;
    &:hover {
      color: ${({ theme }) => theme.colors.variants.primary.text};
    }
  }

  .form__select .form__select__value-container,
  .form__select .form__select__multi-value__label,
  .form__select .form__select__multi-value__remove {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .form__select .form__select__menu {
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .form__select .form__select__option {
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: default;
    &.form__select__option--is-disabled {
      color: ${({ theme }) => theme.colors.text.subtle};
      cursor: not-allowed;
    }

    &.form__select__option--is-selected,
    &:active:not(.form__select__option--is-disabled) {
      background-color: ${({ theme }) => theme.colors.variants.primary.base};
      color: ${({ theme }) => theme.colors.variants.primary.text};
    }

    &.form__select__option--is-focused {
      transition: 0.2s;
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
      transition: 0.2s;
    }
  }
`

export default DocAssigneeSelect

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
`

function getOptionByUser(user: SerializedUser): FormSelectOption {
  return {
    label: (
      <ItemContainer>
        <UserIcon user={user} className='assignee__item__icon' />
        {user.uniqueName}
      </ItemContainer>
    ),
    value: user.id,
  }
}

function getSelectedOptionsByUserId(
  value: string[],
  userMap: Map<string, SerializedUser>
): FormSelectOption[] {
  return value.reduce<FormSelectOption[]>((options, userId) => {
    const user = userMap.get(userId)
    if (user == null) {
      console.warn(`User Id ${userId} does not exist in page props`)
      return options
    }
    options.push({
      value: user.id,
      label: <UserIcon user={user} className='assignee__item__icon' />,
    })
    return options
  }, [])
}

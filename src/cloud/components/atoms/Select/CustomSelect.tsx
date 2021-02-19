import React, { useMemo } from 'react'
import Select from 'react-select'
import { useSettings } from '../../../lib/stores/settings'
import cc from 'classcat'
import styled, { selectTheme } from '../../../lib/styled'

export interface CustomSelectOption {
  label: string | React.ReactNode
  value: string
  data: any
}

interface ReactSelectStates {
  isDisabled: boolean
  isFocused: boolean
  isSelected: boolean
}

interface StyledSelectProps {
  options: CustomSelectOption[]
  value?: CustomSelectOption | CustomSelectOption[]
  onChange: (val: any) => void
  closeMenuOnSelect?: boolean
  className?: string
  classNamePrefix?: string
  isDisabled?: boolean
  isLoading?: boolean
  isMulti?: boolean
  isSearchable?: boolean
  name?: string
  style?: React.CSSProperties
  filterOption?: (option: CustomSelectOption, rawInput: string) => boolean
  onMenuOpen?: () => void
}

const CustomSelect = ({
  options,
  value,
  onChange,
  closeMenuOnSelect = true,
  className,
  classNamePrefix = 'select',
  isDisabled = false,
  isLoading = false,
  isMulti = false,
  isSearchable = false,
  name,
  style,
  filterOption,
  onMenuOpen,
}: StyledSelectProps) => {
  const { settings } = useSettings()

  const customSelectStyle = useMemo(() => {
    const appTheme = selectTheme(settings['general.theme'])
    return {
      control: (styles: any, { isFocused }: ReactSelectStates) => ({
        ...styles,
        width: '100%',
        height: '40px',
        backgroundColor: appTheme.subtleBackgroundColor,
        color: appTheme.subtleTextColor,
        border: 'none',
        boxShadow: isFocused
          ? `0 0 0 2px ${appTheme.primaryShadowColor};`
          : null,
      }),
      singleValue: (styles: any) => ({
        ...styles,
        color: appTheme.subtleTextColor,
      }),
      input: (styles: any, { isDisabled }: ReactSelectStates) => ({
        ...styles,
        opacity: isDisabled ? 0.6 : 'inherit',
        color: appTheme.emphasizedTextColor,
      }),
      multiValue: (styles: any) => ({
        ...styles,
        backgroundColor: appTheme.subtleBackgroundColor,
      }),
      multiValueLabel: (styles: any) => ({
        ...styles,
        color: appTheme.subtleTextColor,
      }),
      multiValueRemove: (styles: any) => ({
        ...styles,
        color: appTheme.subtleTextColor,
        ':hover': {
          color: appTheme.primaryBackgroundColor,
          backgroundColor: appTheme.emphasizedBackgroundColor,
        },
      }),
      valueContainer: (styles: any) => ({
        ...styles,
        color: appTheme.subtleTextColor,
      }),
      dropdownIndicator: (styles: any) => ({
        ...styles,
        color: `${appTheme.subtleTextColor} !important`,
      }),
      menu: (styles: any) => ({
        ...styles,
        background: appTheme.baseBackgroundColor,
        boxShadow: appTheme.baseShadowColor,
      }),
      option: (
        styles: any,
        { isDisabled, isFocused, isSelected }: ReactSelectStates
      ) => {
        return {
          ...styles,
          transition: isFocused ? '0.2s' : null,
          backgroundColor: isDisabled
            ? null
            : isSelected
            ? null
            : isFocused
            ? appTheme.subtleBackgroundColor
            : null,
          color: isDisabled
            ? appTheme.subtleTextColor
            : isFocused
            ? appTheme.emphasizedTextColor
            : appTheme.subtleTextColor,
          cursor: isDisabled ? 'not-allowed' : 'default',
          ':active': {
            ...styles[':active'],
            backgroundColor: !isDisabled && appTheme.emphasizedBackgroundColor,
          },
          ':hover': {
            ...styles[':hover'],
            backgroundColor: appTheme.subtleBackgroundColor,
            transition: '0.2s',
          },
        }
      },
    }
  }, [settings])

  return (
    <StyledSelect style={style}>
      <Select
        closeMenuOnSelect={closeMenuOnSelect}
        options={options}
        style={customSelectStyle}
        className={cc(['rc-select', className])}
        classNamePrefix={classNamePrefix}
        value={value}
        filterOption={filterOption}
        onChange={onChange}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isSearchable={isSearchable}
        isMulti={isMulti}
        name={name}
        onMenuOpen={onMenuOpen}
      />
    </StyledSelect>
  )
}

const StyledSelect = styled.div`
  .select__input input {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  .select__indicator-separator {
    width: 0;
  }
`

export default CustomSelect

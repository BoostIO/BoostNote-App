import React, { forwardRef, useMemo } from 'react'
import DateConditionValueTypeSelect from './DateConditionValueTypeSelect'
import DatePicker from 'react-datepicker'
import { format as formatDate } from 'date-fns'
import { mdiCalendar, mdiCalendarStart, mdiCalendarEnd } from '@mdi/js'
import Icon from '../../../../../design/components/atoms/Icon'
import styled from '../../../../../design/lib/styled'
import { DateCondition } from '../../../../interfaces/db/smartView'
import { Kind } from './interfaces'
import Portal from '../../../../../design/components/atoms/Portal'

interface DocDateSelectProps {
  usePortal?: boolean
  value: DateCondition | null
  disabled?: boolean
  update: (value: DateCondition | null) => void
}

const DocDateSelect = ({
  value,
  disabled,
  usePortal = true,
  update,
}: DocDateSelectProps) => {
  return (
    <>
      <DateConditionValueTypeSelect
        value={value}
        update={update}
        disabled={disabled}
      />
      {value != null &&
        (value.type === 'specific' ||
          value.type === 'before' ||
          value.type === 'after') && (
          <SpecificDatePicker
            usePortal={usePortal}
            value={value}
            update={update}
            disabled={disabled}
          />
        )}
      {value != null && value.type === 'between' && (
        <DateRangePicker
          usePortal={usePortal}
          value={value}
          update={update}
          disabled={disabled}
        />
      )}
    </>
  )
}

export default DocDateSelect

interface SpecificDatePickerProps {
  usePortal?: boolean
  value: Kind<DateCondition, 'specific' | 'after' | 'before'>
  disabled?: boolean
  update: (value: DateCondition) => void
}

const SpecificDatePicker = ({
  value,
  disabled,
  usePortal,
  update,
}: SpecificDatePickerProps) => {
  const updateDate = (newDate: Date) => {
    update({
      ...value,
      date: normalizeLocalDate(newDate),
    })
  }

  const localDate = useMemo(() => {
    return value.date != null ? localizeDate(value.date) : null
  }, [value])

  return (
    <DatePicker
      disabled={disabled}
      selected={localDate}
      onChange={updateDate}
      customInput={<DatePickerButton date={localDate} />}
      popperContainer={
        usePortal
          ? (props: { children: React.ReactNode[] }) => (
              <Portal
                domTarget={document.getElementById('application__anchor')}
              >
                {props.children}
              </Portal>
            )
          : undefined
      }
    />
  )
}

export function normalizeLocalDate(date: Date) {
  return new Date(formatDate(date, 'yyyy-MM-dd') + 'T00:00:00.000Z')
}

export function localizeDate(date: Date) {
  const [dateString] = (typeof date === 'string' ? new Date(date) : date)
    .toISOString()
    .split('T')

  return new Date(dateString)
}

interface DateRangePickerProps {
  usePortal?: boolean
  disabled?: boolean
  value: Kind<DateCondition, 'between'>
  update: (value: DateCondition) => void
}

const DateRangePicker = ({
  value,
  disabled,
  usePortal,
  update,
}: DateRangePickerProps) => {
  const updateFromDate = (date: Date) => {
    update({
      ...value,
      from: normalizeLocalDate(date),
    })
  }
  const updateToDate = (date: Date) => {
    update({
      ...value,
      to: normalizeLocalDate(date),
    })
  }

  const localFromDate = useMemo(() => {
    return value.from != null ? localizeDate(value.from) : null
  }, [value])

  const localToDate = useMemo(() => {
    return value.to != null ? localizeDate(value.to) : null
  }, [value])
  return (
    <>
      <DatePicker
        disabled={disabled}
        selected={localFromDate}
        onChange={updateFromDate}
        placeholderText='Select Start Date'
        popperContainer={
          usePortal
            ? (props: { children: React.ReactNode[] }) => (
                <Portal
                  domTarget={document.getElementById('application__anchor')}
                >
                  {props.children}
                </Portal>
              )
            : undefined
        }
        customInput={
          <DatePickerButton
            date={localFromDate}
            customIconPath={mdiCalendarStart}
          />
        }
      />
      <DatePicker
        disabled={disabled}
        selected={localToDate}
        onChange={updateToDate}
        placeholderText='Select End Date'
        popperContainer={
          usePortal
            ? (props: { children: React.ReactNode[] }) => (
                <Portal
                  domTarget={document.getElementById('application__anchor')}
                >
                  {props.children}
                </Portal>
              )
            : undefined
        }
        customInput={
          <DatePickerButton
            date={localToDate}
            customIconPath={mdiCalendarEnd}
          />
        }
      />
    </>
  )
}

interface DatePickerButtonProps {
  disabled?: boolean
  customIconPath?: string
  placeholder?: string
  date: Date | null
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const DatePickerButton = forwardRef<
  HTMLButtonElement,
  DatePickerButtonProps
>(
  (
    {
      disabled,
      customIconPath = mdiCalendar,
      date,
      onClick,
      placeholder = 'Select Date',
    }: DatePickerButtonProps,
    ref
  ) => {
    return (
      <ButtonContainer
        disabled={disabled}
        ref={ref}
        type='button'
        onClick={onClick}
      >
        <Icon path={customIconPath} />
        {date != null ? formatDate(date, 'MMM dd, yyyy') : placeholder}
      </ButtonContainer>
    )
  }
)

const ButtonContainer = styled.button`
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  display: flex;
  width: 140px;
  height: 32px;
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  outline: none;
  border-radius: 4px;
  background: none;
  color: inherit;
  box-sizing: border-box;
  transition: 200ms background-color;

  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  color: ${({ theme }) => theme.colors.text.subtle};
  padding: 0 3px !important;

  .icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base};
  }

  &:not(.button__state--disabled) {
    &:hover,
    &:active,
    &:focus,
    &.button__state--active {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

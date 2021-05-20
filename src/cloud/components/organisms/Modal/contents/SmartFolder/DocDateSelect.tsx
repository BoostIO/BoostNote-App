import React, { forwardRef } from 'react'
import { DateConditionValue } from '../../../../../interfaces/db/smartFolder'
import DateConditionValueTypeSelect from './DateConditionValueTypeSelect'
import DatePicker from 'react-datepicker'
import { format as formatDate } from 'date-fns'
import { mdiCalendar, mdiCalendarStart, mdiCalendarEnd } from '@mdi/js'
import Icon from '../../../../../../shared/components/atoms/Icon'
import styled from '../../../../../../shared/lib/styled'
import {
  EditibleDateConditionValue,
  EditibleBetweenDateConditionValue,
  EditibleSpecificDateConditionValue,
  EditibleBeforeDateConditionValue,
  EditibleAfterDateConditionValue,
} from './interfaces'

interface DocDateSelectProps {
  value: EditibleDateConditionValue | null
  update: (value: EditibleDateConditionValue | null) => void
}

const DocDateSelect = ({ value, update }: DocDateSelectProps) => {
  return (
    <>
      <DateConditionValueTypeSelect value={value} update={update} />
      {value != null &&
        (value.type === 'specific' ||
          value.type === 'before' ||
          value.type === 'after') && (
          <SpecificDatePicker value={value} update={update} />
        )}
      {value != null && value.type === 'between' && (
        <DateRangePicker value={value} update={update} />
      )}
    </>
  )
}

export default DocDateSelect

interface SpecificDatePickerProps {
  value:
    | EditibleSpecificDateConditionValue
    | EditibleBeforeDateConditionValue
    | EditibleAfterDateConditionValue
  update: (value: DateConditionValue) => void
}

const SpecificDatePicker = ({ value, update }: SpecificDatePickerProps) => {
  const updateDate = (newDate: Date) => {
    update({
      ...value,
      date: newDate,
    })
  }

  return (
    <DatePicker
      selected={value.date}
      onChange={updateDate}
      customInput={<DatePickerButton date={value.date} />}
    />
  )
}

interface DateRangePickerProps {
  value: EditibleBetweenDateConditionValue
  update: (value: EditibleBetweenDateConditionValue) => void
}

const DateRangePicker = ({ value, update }: DateRangePickerProps) => {
  const updateFromDate = (date: Date) => {
    update({
      ...value,
      from: date,
    })
  }
  const updateToDate = (date: Date) => {
    update({
      ...value,
      to: date,
    })
  }
  return (
    <>
      <DatePicker
        selected={value.from}
        onChange={updateFromDate}
        placeholderText='Select Start Date'
        customInput={
          <DatePickerButton
            date={value.from}
            customIconPath={mdiCalendarStart}
          />
        }
      />
      <DatePicker
        selected={value.to}
        onChange={updateToDate}
        placeholderText='Select End Date'
        customInput={
          <DatePickerButton date={value.to} customIconPath={mdiCalendarEnd} />
        }
      />
    </>
  )
}

interface DatePickerButtonProps {
  customIconPath?: string
  placeholder?: string
  date: Date | null
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const DatePickerButton = forwardRef<HTMLButtonElement, DatePickerButtonProps>(
  ({
    customIconPath = mdiCalendar,
    date,
    onClick,
    placeholder = 'Select Date',
  }: DatePickerButtonProps) => {
    return (
      <ButtonContainer onClick={onClick}>
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

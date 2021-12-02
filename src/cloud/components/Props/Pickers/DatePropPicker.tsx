import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import PropertyValueButton from './PropertyValueButton'
import { format as formatDate, isValid } from 'date-fns'
import styled from '../../../../design/lib/styled'
import Button from '../../../../design/components/atoms/Button'
import {
  mdiCalendarMonthOutline,
  mdiCalendarRemoveOutline,
  mdiClose,
} from '@mdi/js'
import cc from 'classcat'
import { useModal } from '../../../../design/lib/stores/modal'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import Switch from '../../../../design/components/atoms/Switch'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import { filterIter } from '../../../lib/utils/iterator'

interface DatePropPickerProps {
  className?: string
  sending?: boolean
  emptyLabel?: string
  isReadOnly: boolean
  date?: Date | Date[] | null
  onDueDateChange: (newDueDate: Date | Date[] | null) => void
  disabled?: boolean
}

const DatePropPicker = ({
  className,
  sending,
  disabled,
  isReadOnly,
  emptyLabel,
  date: propDate,
  onDueDateChange,
}: DatePropPickerProps) => {
  const [date, setDate] = useState<Date | Date[] | null>(getValidDate(propDate))
  const { openContextModal } = useModal()

  const isDue = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0)
    if (date == null) {
      return true
    }

    return Array.isArray(date) ? date[date.length - 1] > today : date > today
  }, [date])

  useEffect(() => {
    const dates = getValidDate(propDate)
    setDate(dates)
  }, [propDate])

  return (
    <Container className='item__due-date__select prop__margin'>
      <PropertyValueButton
        className={cc([
          'date__prop-picker',
          className,
          isDue && 'due__date__expired',
        ])}
        sending={sending}
        empty={date == null && emptyLabel == null}
        isReadOnly={isReadOnly}
        disabled={sending || disabled}
        iconPath={!isDue ? mdiCalendarMonthOutline : mdiCalendarRemoveOutline}
        onClick={(e) =>
          openContextModal(
            e,
            <DatePropPickerModal
              initialDate={date}
              sendDateUpdate={onDueDateChange}
            />,
            {
              width: 300,
              removePadding: true,
            }
          )
        }
      >
        {date != null
          ? Array.isArray(date)
            ? `${formatDate(date[0], 'MMM dd, yyyy')} -> ${formatDate(
                date[1],
                'MMM dd, yyyy'
              )}`
            : formatDate(date, 'MMM dd, yyyy')
          : emptyLabel != null
          ? emptyLabel
          : 'Add Date'}
      </PropertyValueButton>
      {date != null && (
        <Button
          variant='icon'
          iconPath={mdiClose}
          className='due__date__clear'
          iconSize={16}
          size='sm'
          onClick={() => onDueDateChange(null)}
        />
      )}
    </Container>
  )
}

interface DatePropPickerModalProps {
  initialDate: Date | Date[] | null
  sendDateUpdate: (newDueDate: Date | Date[] | null) => void
}
const DatePropPickerModal = ({
  initialDate,
  sendDateUpdate,
}: DatePropPickerModalProps) => {
  const [date, setDate] = useState<Date | Date[] | null>(initialDate)
  const [showRange, setShowRange] = useState(Array.isArray(initialDate))
  const [sending, setSending] = useState(false)
  const format = 'MMM dd, yyyy'

  const onDateChange = useCallback(
    async (val: Date | Date[] | null) => {
      if (sending) {
        return
      }

      setDate(val)
      setSending(true)
      const filteredProp = Array.isArray(val)
        ? filterIter((val) => val != null, val)
        : val
      await sendDateUpdate(
        Array.isArray(filteredProp) && filteredProp.length === 1
          ? filteredProp[0]
          : filteredProp
      )
      setSending(false)
    },
    [sending, sendDateUpdate]
  )

  const setSwitch = useCallback(
    (checked: boolean) => {
      setShowRange(checked)
      if (!checked && Array.isArray(date)) {
        return onDateChange(isValid(date[0]) ? date[0] : null)
      }
      return
    },
    [date, onDateChange]
  )

  return (
    <ModalContainer>
      <Flexbox
        justifyContent='space-between'
        className='date__prop-picker__header'
      >
        <FormInput
          className='date__prop-picker__start-date'
          readOnly={true}
          value={
            date == null
              ? ''
              : Array.isArray(date)
              ? formatDate(date[0], format)
              : formatDate(date, format)
          }
          placeholder={showRange ? 'Start Date..' : 'Date'}
        />
        {Array.isArray(date) && date.length > 1 && (
          <FormInput
            className='date__prop-picker__end-date'
            placeholder='End Date..'
            readOnly={true}
            value={
              isValid(date[date.length - 1])
                ? formatDate(date[date.length - 1], format)
                : ''
            }
          />
        )}
      </Flexbox>
      <DatePicker
        selected={date != null ? (Array.isArray(date) ? date[0] : date) : null}
        startDate={date != null ? (Array.isArray(date) ? date[0] : date) : null}
        endDate={
          date != null && Array.isArray(date) && date.length > 1
            ? date[date.length - 1]
            : null
        }
        onChange={onDateChange}
        inline={true}
        selectsRange={showRange}
        disabled={true}
        disabledKeyboardNavigation={true}
      />
      <MetadataContainerBreak />
      <MetadataContainerRow
        row={{
          type: 'content',
          label: 'End date',
          content: (
            <Switch
              id='end-date-switch'
              checked={showRange}
              disabled={sending}
              onChange={(checked) => setSwitch(checked)}
            />
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Clear',
            onClick: () => onDateChange(null),
            disabled: sending,
          },
        }}
      />
    </ModalContainer>
  )
}

function getValidDate(
  value: Date | Date[] | string | string[] | null | undefined
): Date | Date[] | null {
  console.log(value)
  if (value == null) {
    return null
  }

  if (Array.isArray(value)) {
    if (value.length > 2) {
      return null
    }

    const dates: Date[] = []

    value.forEach((val) => {
      const date = typeof val === 'string' ? new Date(val) : val
      if (isValid(date)) {
        return dates.push(date)
      }
      return dates
    })

    return dates.sort((a, b) => {
      if (a < b) {
        return -1
      } else {
        return 1
      }
    })
  }

  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isValid(date)) {
      return null
    }
    return date
  } else {
    return value
  }
}

const ModalContainer = styled(MetadataContainer)`
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  .date__prop-picker__header {
    padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    input {
      width: 100%;
    }
  }

  .date__prop-picker__end-date {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .date__prop-picker__header,
  .react-datepicker {
    width: 100%;
  }

  .react-datepicker {
    border: 0 !important;
    background: none !important;

    .react-datepicker__header {
      background: none !important;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    }

    .react-datepicker__month-container {
      width: 100%;
    }

    .react-datepicker__current-month,
    .react-datepicker__day-name,
    .react-datepicker__day {
      color: ${({ theme }) => theme.colors.text.primary};
    }

    .react-datepicker__day {
      &.react-datepicker__day--selected {
        background: ${({ theme }) => theme.colors.variants.primary.base};
        color: ${({ theme }) => theme.colors.variants.primary.text};
      }
      &.react-datepicker__day--keyboard-selected {
        background: ${({ theme }) => theme.colors.variants.primary.base};
        color: ${({ theme }) => theme.colors.variants.primary.text};
        filter: brightness(130%);
      }
      &:hover {
        background: ${({ theme }) => theme.colors.background.secondary};
      }
    }
  }

  .metadata__button {
    padding: 0;
  }

  .metadata__break {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .metadata__item--row,
  .metadata__item--row .metadata__content,
  .metadata__item--row .switch__wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .metadata__content {
    justify-content: end;
  }
`

const Container = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;

  .due__date__expired {
    .doc__property__button__icon,
    .doc__property__button__label {
      color: #bd2929;
    }
  }

  .due__date__expired {
    &:hover,
    &:active,
    &:focus,
    &.button__state--active {
      .doc__property__button__icon,
      .doc__property__button__label {
        color: #de1e1e;
      }
    }
  }

  .due__date__clear {
    display: none;
    position: absolute;
    right: -8px;
    top: 0;
    transform: translateY(-15%);
  }

  &:hover {
    .due__date__clear {
      display: block;
    }
  }
`

export default DatePropPicker

import React, { useState, useEffect, useMemo, ReactNode } from 'react'
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
import Portal from '../../../../design/components/atoms/Portal'

interface DatePropPickerProps {
  className?: string
  sending?: boolean
  emptyLabel?: string
  isReadOnly: boolean
  date?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
  disabled?: boolean
  shortenedLabel?: boolean
  portalId?: string
}

const DatePropPicker = ({
  className,
  sending,
  disabled,
  isReadOnly,
  emptyLabel,
  date: dueDateString,
  onDueDateChange,
  portalId,
}: DatePropPickerProps) => {
  const [dueDate, setDueDate] = useState(() => {
    const date = dueDateString != null ? new Date(dueDateString) : null
    return date == null || !isValid(date) ? null : date
  })
  const isDue = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0)
    return dueDate != null && dueDate < today
  }, [dueDate])

  useEffect(() => {
    setDueDate(() => {
      const date = dueDateString != null ? new Date(dueDateString) : null
      return date == null || !isValid(date) ? null : date
    })
  }, [dueDateString])

  return (
    <Container className='item__due-date__select prop__margin'>
      <DatePicker
        wrapperClassName={className}
        disabled={sending || disabled}
        selected={dueDate}
        onChange={onDueDateChange}
        popperPlacement='bottom-start'
        popperContainer={
          portalId != null
            ? (props: { children: ReactNode[] }) => (
                <Portal domTarget={document.getElementById(portalId)}>
                  {props.children}
                </Portal>
              )
            : undefined
        }
        customInput={
          <PropertyValueButton
            className={isDue ? 'due__date__expired' : ''}
            sending={sending}
            empty={dueDate == null && emptyLabel == null}
            isReadOnly={isReadOnly}
            iconPath={
              !isDue ? mdiCalendarMonthOutline : mdiCalendarRemoveOutline
            }
          >
            {dueDate != null
              ? formatDate(dueDate, 'MMM dd, yyyy')
              : emptyLabel != null
              ? emptyLabel
              : 'Add Date'}
          </PropertyValueButton>
        }
      />
      {dueDate != null && (
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

import React, { useState, useEffect, useMemo, ReactNode } from 'react'
import DatePicker from 'react-datepicker'
import PropertyValueButton from './PropertyValueButton'
import { format as formatDate } from 'date-fns'
import styled from '../../../../design/lib/styled'
import Button from '../../../../design/components/atoms/Button'
import {
  mdiCalendarMonthOutline,
  mdiCalendarRemoveOutline,
  mdiClose,
} from '@mdi/js'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import Portal from '../../../../design/components/atoms/Portal'

interface DueDateSelectProps {
  className?: string
  sending?: boolean
  isReadOnly: boolean
  dueDate?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
  disabled?: boolean
  shortenedLabel?: boolean
  portalId?: string
  isErrored?: boolean
}

const DueDateSelect = ({
  className,
  sending,
  disabled,
  isReadOnly,
  isErrored,
  shortenedLabel,
  dueDate: dueDateString,
  onDueDateChange,
  portalId,
}: DueDateSelectProps) => {
  const { translate } = useI18n()
  const [dueDate, setDueDate] = useState(() => {
    return dueDateString != null ? new Date(dueDateString) : null
  })
  const isDue = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0)
    return dueDate != null && dueDate < today
  }, [dueDate])

  useEffect(() => {
    setDueDate(dueDateString != null ? new Date(dueDateString) : null)
  }, [dueDateString])

  return (
    <Container className='item__due-date__select prop__margin'>
      <DatePicker
        wrapperClassName={className}
        disabled={sending || disabled}
        selected={dueDate}
        onChange={onDueDateChange}
        popperPlacement='top-end'
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
            empty={dueDate == null}
            isReadOnly={isReadOnly}
            isErrored={isErrored}
            iconPath={
              !isDue ? mdiCalendarMonthOutline : mdiCalendarRemoveOutline
            }
          >
            {dueDate != null
              ? formatDate(dueDate, 'MMM dd, yyyy')
              : shortenedLabel
              ? translate(lngKeys.DueDate)
              : translate(lngKeys.AddDueDate)}
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

export default DueDateSelect

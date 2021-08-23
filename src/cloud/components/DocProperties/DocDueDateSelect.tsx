import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import DocPropertyValueButton from './DocPropertyValueButton'
import { format as formatDate } from 'date-fns'
import styled from '../../../design/lib/styled'
import Button from '../../../design/components/atoms/Button'
import { mdiCalendarMonthOutline, mdiClose } from '@mdi/js'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

interface DocDueDateSelectProps {
  className?: string
  sending?: boolean
  isReadOnly: boolean
  dueDate?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
  disabled?: boolean
  shortenedLabel?: boolean
}

const DocDueDateSelect = ({
  className,
  sending,
  disabled,
  isReadOnly,
  shortenedLabel,
  dueDate: dueDateString,
  onDueDateChange,
}: DocDueDateSelectProps) => {
  const { translate } = useI18n()
  const [dueDate, setDueDate] = useState(() => {
    return dueDateString != null ? new Date(dueDateString) : null
  })

  useEffect(() => {
    setDueDate(dueDateString != null ? new Date(dueDateString) : null)
  }, [dueDateString])

  return (
    <Container className='doc__due-date__select prop__margin'>
      <DatePicker
        wrapperClassName={className}
        disabled={sending || disabled}
        selected={dueDate}
        onChange={onDueDateChange}
        popperPlacement='top-end'
        customInput={
          <DocPropertyValueButton
            sending={sending}
            empty={dueDate == null}
            isReadOnly={isReadOnly}
            iconPath={mdiCalendarMonthOutline}
          >
            {dueDate != null
              ? formatDate(dueDate, 'MMM dd, yyyy')
              : shortenedLabel
              ? translate(lngKeys.DueDate)
              : translate(lngKeys.AddDueDate)}
          </DocPropertyValueButton>
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

export default DocDueDateSelect

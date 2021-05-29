import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import DocPropertyValueButton from './DocPropertyValueButton'
import { format as formatDate } from 'date-fns'
import styled from '../../../../../../../shared/lib/styled'
import Button from '../../../../../../../shared/components/atoms/Button'
import { mdiClose } from '@mdi/js'

interface DocDueDateSelectProps {
  className?: string
  sending?: boolean
  dueDate?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
}

const DocDueDateSelect = ({
  className,
  sending,
  dueDate: dueDateString,
  onDueDateChange,
}: DocDueDateSelectProps) => {
  const [dueDate, setDueDate] = useState(() => {
    return dueDateString != null ? new Date(dueDateString) : null
  })

  useEffect(() => {
    setDueDate(dueDateString != null ? new Date(dueDateString) : null)
  }, [dueDateString])

  return (
    <Container>
      <DatePicker
        wrapperClassName={className}
        disabled={sending}
        selected={dueDate}
        onChange={onDueDateChange}
        popperPlacement='top-end'
        customInput={
          <DocPropertyValueButton sending={sending} empty={dueDate == null}>
            {dueDate != null
              ? formatDate(dueDate, 'MMM dd, yyyy')
              : 'Add due date'}
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
          onClick={() => setDueDate(null)}
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
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  &:hover {
    .due__date__clear {
      display: block;
    }
  }
`

export default DocDueDateSelect

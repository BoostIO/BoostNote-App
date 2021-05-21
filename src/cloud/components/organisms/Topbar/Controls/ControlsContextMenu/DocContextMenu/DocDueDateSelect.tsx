import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import DocPropertyValueButton from './DocPropertyValueButton'
import { format as formatDate } from 'date-fns'

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
    <DatePicker
      wrapperClassName={className}
      disabled={sending}
      selected={dueDate}
      onChange={onDueDateChange}
      popperPlacement='top-end'
      customInput={
        <DocPropertyValueButton sending={sending}>
          {dueDate != null
            ? formatDate(dueDate, 'MMM dd, yyyy')
            : 'Add due date'}
        </DocPropertyValueButton>
      }
    />
  )
}

export default DocDueDateSelect

import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { LoadingButton } from '../../../../../../../shared/components/atoms/Button'

interface DocDueDateSelectProps {
  sending?: boolean
  dueDate?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
}

const DocDueDateSelect = ({
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
      disabled={sending}
      selected={dueDate}
      onChange={onDueDateChange}
      popperPlacement='top'
      customInput={
        <LoadingButton spinning={sending} variant='transparent'>
          {dueDate != null ? dueDate.toString() : 'Empty'}
        </LoadingButton>
      }
    />
  )
}

export default DocDueDateSelect

import { format, isValid } from 'date-fns'
import React, { useCallback, useMemo } from 'react'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import styled from '../../../../design/lib/styled'
import { BlockPropertyProps } from './types'

const DateProp = ({ value, onUpdate }: BlockPropertyProps) => {
  const date = useMemo(() => {
    const parsed = new Date(value)
    return isValid(parsed) ? parsed : null
  }, [value])

  const onChange: ReactDatePickerProps['onChange'] = useCallback(
    (date) => {
      if (date == null) {
        onUpdate('')
      } else if (Array.isArray(date)) {
        onUpdate(date[0].toISOString())
      } else {
        onUpdate(date.toISOString())
      }
    },
    [onUpdate]
  )

  return (
    <Container>
      <DatePicker
        selected={date}
        onChange={onChange}
        popperPlacement='top-end'
        customInput={
          <div>
            {date != null ? format(date, 'MMM dd, yyyy') : 'Click to add...'}
          </div>
        }
      />
    </Container>
  )
}

export default DateProp

const Container = styled.div`
  cursor: pointer;
`

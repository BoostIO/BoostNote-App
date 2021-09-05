import { mdiCalendarMonthOutline, mdiClose } from '@mdi/js'
import { isValid } from 'date-fns'
import React, { useCallback, useMemo } from 'react'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import styled from '../../../../design/lib/styled'
import DocPropertyValueButton from '../../DocProperties/DocPropertyValueButton'
import { BlockPropertyProps } from './types'
import { format as formatDate } from 'date-fns'
import Button from '../../../../design/components/atoms/Button'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import Portal from '../../../../design/components/atoms/Portal'

const DateProp = ({
  value,
  onUpdate,
  currentUserIsCoreMember,
}: BlockPropertyProps) => {
  const { translate } = useI18n()
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
    <Container className='doc__due-date__select prop__margin'>
      <DatePicker
        disabled={!currentUserIsCoreMember}
        selected={date}
        onChange={onChange}
        popperPlacement='auto'
        popperContainer={CalendarContainer}
        customInput={
          <DocPropertyValueButton
            empty={date == null}
            isReadOnly={!currentUserIsCoreMember}
            iconPath={mdiCalendarMonthOutline}
          >
            {date != null
              ? formatDate(date, 'MMM dd, yyyy')
              : translate(lngKeys.DueDate)}
          </DocPropertyValueButton>
        }
      />
      {value.trim() !== '' && (
        <Button
          variant='icon'
          iconPath={mdiClose}
          className='due__date__clear'
          iconSize={16}
          size='sm'
          onClick={() => onUpdate('')}
        />
      )}
    </Container>
  )
}

const CalendarContainer = ({ children }: { children: any }) => {
  const portalContainer = document.getElementById('block__editor__anchor')

  if (portalContainer == null) {
    return null
  }

  return <Portal target={portalContainer}>{children}</Portal>
}

export default DateProp

const Container = styled.div`
  min-width: 180px;
`

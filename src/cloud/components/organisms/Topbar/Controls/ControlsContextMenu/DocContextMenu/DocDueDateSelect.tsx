import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import DocPropertyValueButton from './DocPropertyValueButton'
import { format as formatDate } from 'date-fns'
import styled from '../../../../../../../shared/lib/styled'
import Button from '../../../../../../../shared/components/atoms/Button'
import { mdiClose } from '@mdi/js'
import { useI18n } from '../../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../../lib/i18n/types'

interface DocDueDateSelectProps {
  className?: string
  sending?: boolean
  isReadOnly: boolean
  dueDate?: string | null
  onDueDateChange: (newDueDate: Date | null) => void
  disabled?: boolean
}

const DocDueDateSelect = ({
  className,
  sending,
  disabled,
  isReadOnly,
  dueDate: dueDateString,
  onDueDateChange,
}: DocDueDateSelectProps) => {
  const { t } = useI18n()
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
        disabled={sending || disabled}
        selected={dueDate}
        onChange={onDueDateChange}
        popperPlacement='top-end'
        customInput={
          <DocPropertyValueButton
            sending={sending}
            empty={dueDate == null}
            isReadOnly={isReadOnly}
          >
            {dueDate != null
              ? formatDate(dueDate, 'MMM dd, yyyy')
              : t(lngKeys.AddDueDate)}
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

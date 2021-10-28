import React from 'react'
import FormSelect from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import { DateCondition } from '../../../../interfaces/db/dashboard'

const DAYS_7 = 60 * 60 * 24 * 7
const DAYS_30 = 60 * 60 * 24 * 30

const OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7_days' },
  { label: 'Last 30 days', value: '30_days' },
  {
    label: 'Specific',
    value: 'specific',
  },
  {
    label: 'Between',
    value: 'between',
  },
  {
    label: 'After',
    value: 'after',
  },
  {
    label: 'Before',
    value: 'before',
  },
]

interface DateValueTypeSelectProps {
  value: DateCondition | null
  update: (dateConditionValue: DateCondition) => void
}

const DateConditionValueTypeSelect = ({
  value: dateConditionValue,
  update,
}: DateValueTypeSelectProps) => {
  return (
    <FormSelect
      options={OPTIONS}
      value={
        dateConditionValue != null
          ? getOptionByValueType(dateConditionValue)
          : undefined
      }
      onChange={(selectedOption) => {
        const nextDateConditionValue = getDefaultDateConditionValueByValueType(
          selectedOption.value
        )
        update(nextDateConditionValue)
      }}
    />
  )
}

export default DateConditionValueTypeSelect

function getOptionByValueType(dateValue: DateCondition) {
  switch (dateValue.type) {
    case 'relative': {
      if (dateValue.period == null || dateValue.period === 0) {
        return { label: 'Today', value: 'today' }
      } else if (dateValue.period <= DAYS_7) {
        return { label: 'Last 7 days', value: '7_days' }
      } else {
        return { label: 'Last 30 days', value: '30_days' }
      }
    }
    case 'specific':
      return {
        label: 'Specific',
        value: 'specific',
      }

    case 'between':
      return {
        label: 'Between',
        value: 'between',
      }
    case 'after':
      return {
        label: 'After',
        value: 'after',
      }
    case 'before':
      return {
        label: 'Before',
        value: 'before',
      }
    default:
      return {
        label: 'Today',
        value: 'today',
      }
  }
}

function getDefaultDateConditionValueByValueType(
  dateValueType: string
): DateCondition {
  switch (dateValueType) {
    case '7_days':
      return {
        type: 'relative',
        period: DAYS_7,
      }
    case '30_days':
      return {
        type: 'relative',
        period: DAYS_30,
      }
    case 'specific':
      return {
        type: 'specific',
        date: new Date(),
      }

    case 'between':
      return {
        type: 'between',
        from: new Date(),
        to: new Date(),
      }
    case 'after':
      return {
        type: 'after',
        date: new Date(),
      }
    case 'before':
      return {
        type: 'before',
        date: new Date(),
      }
    case 'today':
    default:
      return {
        type: 'relative',
        period: 0,
      }
  }
}

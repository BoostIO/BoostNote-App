import React from 'react'
import { DateConditionValue, DateConditionValueType } from './interfaces'
import FormSelect from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'

interface DateValueTypeSelectProps {
  value: DateConditionValue
  update: (dateConditionValue: DateConditionValue) => void
}

const DateConditionValueTypeSelect = ({
  value: dateConditionValue,
  update,
}: DateValueTypeSelectProps) => {
  return (
    <FormSelect
      options={([
        'today',
        '7_days',
        '30_days',
        'specific',
        'between',
        'after',
        'before',
      ] as DateConditionValueType[]).map(getOptionByValueType)}
      value={getOptionByValueType(dateConditionValue.type)}
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

function getOptionByValueType(dateValueType: DateConditionValueType) {
  switch (dateValueType) {
    case '7_days':
      return {
        label: '7 days',
        value: '7_days',
      }
    case '30_days':
      return {
        label: '30 days',
        value: '30_days',
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
    case 'today':
    default:
      return {
        label: 'Today',
        value: 'today',
      }
  }
}

function getDefaultDateConditionValueByValueType(
  dateValueType: DateConditionValueType
): DateConditionValue {
  switch (dateValueType) {
    case '7_days':
      return {
        type: '7_days',
      }
    case '30_days':
      return {
        type: '30_days',
      }
    case 'specific':
      return {
        type: 'specific',
        date: null,
      }

    case 'between':
      return {
        type: 'between',
        from: null,
        to: null,
      }
    case 'after':
      return {
        type: 'after',
        date: null,
      }
    case 'before':
      return {
        type: 'before',
        date: null,
      }
    case 'today':
    default:
      return {
        type: 'today',
      }
  }
}

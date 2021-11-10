import React, { useState, useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import { SimpleFormSelect } from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import {
  getReasonMultiplier,
  reasons,
  ReasonType,
} from '../../../Props/Pickers/TimePeriodPicker'

interface TimePeriodFormProps {
  period: number
  disabled?: boolean
  updatePeriod: (period: number) => void
}

const TimePeriodForm = ({
  period,
  disabled,
  updatePeriod,
}: TimePeriodFormProps) => {
  const [value, setValue] = useState('0')
  const [reason, setReason] = useState<ReasonType>('Hours')

  useEffectOnce(() => {
    if (period == null || typeof period !== 'number' || period === 0) {
      return
    }

    let parsedValue

    for (let i = 0; i < reasons.length; i++) {
      const reasonMultipler = getReasonMultiplier(reasons[i])
      if (period % reasonMultipler === 0) {
        parsedValue = {
          value: (period / reasonMultipler).toString(),
          reason: reasons[i],
        }
      }
    }

    if (parsedValue == null) {
      return
    }

    setValue(parsedValue.value)
    setReason(parsedValue.reason)
  })

  const setPeriod = useCallback(
    (
      newValue:
        | { type: 'value'; val: string }
        | { type: 'reason'; val: ReasonType }
    ) => {
      let parsedValue = parseInt(value)
      let newReason = reason

      if (newValue.type === 'value') {
        if (typeof parseInt(newValue.val) !== 'number') {
          return
        }
        parsedValue = parseInt(newValue.val)
        setValue(parsedValue.toString())
      } else {
        setReason(newValue.val)
        newReason = newValue.val
      }

      updatePeriod(parsedValue * getReasonMultiplier(newReason))
    },
    [value, reason, updatePeriod]
  )

  return (
    <>
      <FormRowItem>
        <FormInput
          type='number'
          value={value}
          onChange={(event) =>
            setPeriod({ type: 'value', val: event.target.value })
          }
          disabled={disabled}
        />
      </FormRowItem>
      <FormRowItem>
        <SimpleFormSelect
          value={reason}
          options={reasons}
          onChange={(val) =>
            setPeriod({ type: 'reason', val: val as ReasonType })
          }
          isDisabled={disabled}
        />
      </FormRowItem>
    </>
  )
}

export default TimePeriodForm

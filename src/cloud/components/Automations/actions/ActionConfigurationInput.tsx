import React, { useMemo, useState } from 'react'
import FormSelect from '../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { pickBy } from 'ramda'

const CONFIG_TYPES = [
  { label: 'Event', value: 'event' },
  { label: 'Custom', value: 'custom' },
]

interface ActionConfigurationInputProps {
  onChange: (value: any) => void
  value: any
  customInput: (
    onChange: ActionConfigurationInputProps['onChange'],
    value: any
  ) => React.ReactNode
  eventDataOptions: Record<string, string>
  type?: string
}
const ActionConfigurationInput = ({
  value,
  eventDataOptions,
  onChange,
  customInput,
  type: dataType,
}: ActionConfigurationInputProps) => {
  const [type, setType] = useState(() => {
    if (typeof value === 'string') {
      if (value.startsWith('$event')) {
        return CONFIG_TYPES[0]
      }
      if (value.startsWith('$env')) {
        return CONFIG_TYPES[1]
      }
    }
    return CONFIG_TYPES[1]
  })

  const options = useMemo(() => {
    return Object.keys(
      pickBy((val) => dataType == null || val === dataType, eventDataOptions)
    ).map((key) => ({ label: key, value: key }))
  }, [eventDataOptions, dataType])

  const normalized = useMemo(() => {
    if (typeof value === 'string') {
      if (value.startsWith('$event')) {
        return value.substr('$event.'.length)
      }

      if (value.startsWith('$env')) {
        return value.substr('$env.'.length)
      }
    }

    return typeof value === 'string' || typeof value === 'number'
      ? value.toString()
      : ''
  }, [value])

  return (
    <>
      <FormRowItem>
        <FormSelect options={CONFIG_TYPES} value={type} onChange={setType} />
      </FormRowItem>
      <FormRowItem>
        {type.value === 'event' && (
          <FormSelect
            value={{ label: normalized, value: normalized }}
            options={options}
            onChange={({ value }) => onChange(`$event.${value}`)}
          />
        )}
        {type.value === 'custom' && customInput(onChange, value)}
      </FormRowItem>
    </>
  )
}

export default ActionConfigurationInput

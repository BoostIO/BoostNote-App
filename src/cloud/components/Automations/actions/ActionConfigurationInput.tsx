import React, { useMemo, useState } from 'react'
import FormSelect from '../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { pickBy } from 'ramda'
import { BoostAST } from '../../../lib/automations'
import { RefNode } from '../../../lib/automations/ast'

const CONFIG_TYPES = [
  { label: 'Event', value: 'event' },
  { label: 'Custom', value: 'custom' },
]

interface ActionConfigurationInputProps {
  onChange: (value: BoostAST) => void
  value: BoostAST
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
    if (value.type === 'reference') {
      if (value.identifier.startsWith('$event')) {
        return CONFIG_TYPES[0]
      }
      if (value.identifier.startsWith('$env')) {
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
    if (value.type === 'reference') {
      if (value.identifier.startsWith('$event')) {
        return value.identifier.substr('$event.'.length)
      }

      if (value.identifier.startsWith('$env')) {
        return value.identifier.substr('$env.'.length)
      }
    }

    return value.type === 'literal' ? value.value.toString() : ''
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
            onChange={({ value }) => onChange(RefNode(`$event.${value}`))}
          />
        )}
        {type.value === 'custom' && customInput(onChange, value)}
      </FormRowItem>
    </>
  )
}

export default ActionConfigurationInput

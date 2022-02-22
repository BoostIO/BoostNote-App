import React, { useMemo } from 'react'
import FormSelect from '../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { pickBy } from 'ramda'
import { BoostAST, BoostPrimitives, BoostType } from '../../../lib/automations'
import { LiteralNode, RefNode } from '../../../lib/automations/ast'
import { StdPrimitives } from '../../../lib/automations/types'

const CONFIG_TYPES = [
  { label: 'Event', value: 'event' },
  { label: 'Custom', value: 'custom' },
]

interface ActionConfigurationInputProps {
  onChange: (value: BoostAST) => void
  value: BoostAST
  customInput: (
    onChange: ActionConfigurationInputProps['onChange'],
    value: Extract<BoostAST, { type: 'literal' }> | null
  ) => React.ReactNode
  eventDataOptions: Record<string, BoostType>
  type: BoostPrimitives | StdPrimitives
  defaultValue: any
}
const ActionConfigurationInput = ({
  value,
  eventDataOptions,
  onChange,
  customInput,
  type: dataType,
  defaultValue,
}: ActionConfigurationInputProps) => {
  const type = useMemo(() => {
    if (value == null) {
      return CONFIG_TYPES[1]
    }

    if (value.type === 'reference') {
      if (value.identifier.startsWith('$event')) {
        return CONFIG_TYPES[0]
      }
      if (value.identifier.startsWith('$env')) {
        return CONFIG_TYPES[1]
      }
    }
    return CONFIG_TYPES[1]
  }, [value])

  const options = useMemo(() => {
    return Object.keys(
      pickBy(
        (val) => val.type === 'primitive' && val.def === dataType,
        eventDataOptions
      )
    ).map((key) => ({ label: key, value: key }))
  }, [eventDataOptions, dataType])

  const normalized = useMemo(() => {
    if (value == null) {
      return ''
    }

    if (value.type === 'reference') {
      if (value.identifier.startsWith('$event')) {
        return value.identifier.substr('$event.'.length)
      }

      if (value.identifier.startsWith('$env')) {
        return value.identifier.substr('$env.'.length)
      }
    }

    return value.type === 'literal' ? value.value?.toString() || '' : ''
  }, [value])

  return (
    <>
      <FormRowItem>
        <FormSelect
          options={CONFIG_TYPES}
          value={type}
          onChange={(val) => {
            if (val.value === 'event') {
              onChange(RefNode('$event.'))
            } else {
              onChange(LiteralNode(dataType, defaultValue))
            }
          }}
        />
      </FormRowItem>
      <FormRowItem>
        {type.value === 'event' && (
          <FormSelect
            value={{ label: normalized, value: normalized }}
            options={options}
            onChange={({ value }) => onChange(RefNode(`$event.${value}`))}
          />
        )}
        {type.value === 'custom' &&
          customInput(
            onChange,
            value == null || value.type !== 'literal'
              ? LiteralNode(dataType, defaultValue)
              : value
          )}
      </FormRowItem>
    </>
  )
}

export default ActionConfigurationInput

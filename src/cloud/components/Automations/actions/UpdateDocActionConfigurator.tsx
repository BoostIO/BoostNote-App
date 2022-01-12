import { mdiFileDocumentOutline } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import { FormHeading, FormLabel } from '../../../../components/atoms/form'
import FormEmoji from '../../../../design/components/molecules/Form/atoms/FormEmoji'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import { flattenObj } from '../../../lib/utils/object'
import { ActionConfiguratorProps } from './'
import ActionConfigurationInput from './ActionConfigurationInput'
import PropertySelect, { PropertySelectProps } from './PropertySelect'

// support Props + Title query
const UpdateDocActionConfigurator = ({
  configuration,
  onChange,
  eventType,
}: ActionConfiguratorProps) => {
  const eventDataOptions = useMemo(() => {
    return Object.keys(flattenObj(eventType as any))
  }, [eventType])

  const conditions = useMemo(() => {
    if (!Array.isArray(configuration.query)) {
      return {}
    }

    return configuration.query.reduce(
      (acc: Record<string, any>, condition: any) => {
        if (condition.type === 'prop') {
          acc[condition.value.name] = {
            type: condition.value.type,
            data: condition.value.value,
          }
        }
        return acc
      },
      {}
    )
  }, [configuration.query])

  const setConditions: PropertySelectProps['onChange'] = useCallback(
    (props) => {
      onChange({
        ...configuration,
        query: Object.entries(props).map(([name, prop]) => {
          return {
            type: 'prop',
            value: { name, type: prop.type, value: prop.data },
            rule: 'and',
          }
        }),
      })
    },
    [configuration, onChange]
  )

  return (
    <div>
      <h3>Prop Query</h3>
      <PropertySelect
        value={conditions}
        onChange={setConditions}
        eventDataOptions={eventDataOptions}
      />
      <FormRow row={{ title: 'Title' }}>
        <ActionConfigurationInput
          value={configuration.title}
          onChange={(title) => onChange({ ...configuration, title })}
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormInput
                value={value}
                onChange={(ev) => onChange(ev.target.value)}
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Emoji' }}>
        <ActionConfigurationInput
          value={configuration.emoji}
          onChange={(emoji) => onChange({ ...configuration, emoji })}
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormEmoji
                emoji={value}
                defaultIcon={mdiFileDocumentOutline}
                setEmoji={onChange}
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Content' }}>
        <ActionConfigurationInput
          value={configuration.content}
          onChange={(content) => onChange({ ...configuration, content })}
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormTextarea
                value={value}
                onChange={(ev) => onChange(ev.target.value)}
              />
            )
          }}
        />
      </FormRow>
      <FormLabel>Props</FormLabel>
      <PropertySelect
        value={configuration.props || {}}
        onChange={(props) => onChange({ ...configuration, props })}
        eventDataOptions={eventDataOptions}
      />
    </div>
  )
}

export default UpdateDocActionConfigurator

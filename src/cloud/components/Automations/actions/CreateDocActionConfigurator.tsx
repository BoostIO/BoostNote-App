import { mdiFileDocumentOutline } from '@mdi/js'
import React, { useMemo } from 'react'
import FormEmoji from '../../../../design/components/molecules/Form/atoms/FormEmoji'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import { flattenObj } from '../../../lib/utils/object'
import { ActionConfiguratorProps } from './'
import ActionConfigurationInput from './ActionConfigurationInput'
import FolderSelect from './FolderSelect'
import PropertySelect from './PropertySelect'

const CreateDocActionConfigurator = ({
  configuration,
  onChange,
  eventType,
}: ActionConfiguratorProps) => {
  const eventDataOptions = useMemo(() => {
    return flattenObj(eventType as any)
  }, [eventType])

  return (
    <div>
      <FormRow row={{ title: 'Title' }}>
        <ActionConfigurationInput
          value={configuration.title}
          type={'string'}
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
          type={'string'}
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
          type={'string'}
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
      <FormRow row={{ title: 'Parent Folder' }}>
        <ActionConfigurationInput
          value={configuration.parentFolder}
          type={'string'}
          onChange={(parentFolder) =>
            onChange({ ...configuration, parentFolder })
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return <FolderSelect value={value} onChange={onChange} />
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Props' }}></FormRow>
      <PropertySelect
        value={configuration.props || {}}
        onChange={(props) => onChange({ ...configuration, props })}
        eventDataOptions={eventDataOptions}
      />
    </div>
  )
}

export default CreateDocActionConfigurator

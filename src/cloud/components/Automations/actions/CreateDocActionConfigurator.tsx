import { mdiFileDocumentOutline } from '@mdi/js'
import React, { useMemo } from 'react'
import FormEmoji from '../../../../design/components/molecules/Form/atoms/FormEmoji'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import { LiteralNode, StructNode } from '../../../lib/automations/ast'
import { flattenObj } from '../../../lib/utils/object'
import { ActionConfiguratorProps } from './'
import ActionConfigurationInput from './ActionConfigurationInput'
import FolderSelect from './FolderSelect'
import PropertySelect from './PropertySelect'

// TODO: flatten type (bring from backend) ? do top level? 'declarations' || 'imports'
// TODO: sort by type
const CreateDocActionConfigurator = ({
  configuration,
  onChange,
  eventType,
}: ActionConfiguratorProps) => {
  const eventDataOptions = useMemo(() => {
    return flattenObj(eventType as any)
  }, [eventType])

  const constructorTree = useMemo(() => {
    if (
      configuration.type !== 'constructor' ||
      configuration.info.type !== 'struct'
    ) {
      return {}
    }
    return configuration.info.refs
  }, [configuration])

  return (
    <div>
      <FormRow row={{ title: 'Title' }}>
        <ActionConfigurationInput
          value={constructorTree.title}
          type={'string'}
          onChange={(title) =>
            onChange(StructNode({ ...constructorTree, title }))
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormInput
                value={value}
                onChange={(ev) =>
                  onChange(LiteralNode('string', ev.target.value))
                }
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Emoji' }}>
        <ActionConfigurationInput
          value={constructorTree.emoji}
          type={'string'}
          onChange={(emoji) =>
            onChange(StructNode({ ...constructorTree, emoji }))
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormEmoji
                emoji={value}
                defaultIcon={mdiFileDocumentOutline}
                setEmoji={(emojiStr) =>
                  onChange(LiteralNode('string', emojiStr))
                }
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Content' }}>
        <ActionConfigurationInput
          value={constructorTree.content}
          type={'string'}
          onChange={(content) =>
            onChange(StructNode({ ...constructorTree, content }))
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormTextarea
                value={value}
                onChange={(ev) =>
                  onChange(LiteralNode('string', ev.target.value))
                }
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Parent Folder' }}>
        <ActionConfigurationInput
          value={constructorTree.parentFolder}
          type={'folder'}
          onChange={(parentFolder) =>
            onChange(StructNode({ ...constructorTree, parentFolder }))
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FolderSelect
                value={value}
                onChange={(id) => onChange(LiteralNode('folder', id))}
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Props' }}></FormRow>
      <PropertySelect
        value={constructorTree.props || {}}
        onChange={(props) =>
          onChange(StructNode({ ...constructorTree, props }))
        }
        eventDataOptions={eventDataOptions}
      />
    </div>
  )
}

export default CreateDocActionConfigurator

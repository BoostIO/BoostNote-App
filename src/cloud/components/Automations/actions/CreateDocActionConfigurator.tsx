import { mdiFileDocumentOutline } from '@mdi/js'
import { dissoc } from 'ramda'
import React, { useMemo } from 'react'
import FormEmoji from '../../../../design/components/molecules/Form/atoms/FormEmoji'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import { BoostAST } from '../../../lib/automations'
import {
  LiteralNode,
  RecordNode,
  StructNode,
} from '../../../lib/automations/ast'
import { flattenType } from '../../../lib/automations/types'
import { ActionConfiguratorProps } from './'
import ActionConfigurationInput from './ActionConfigurationInput'
import FolderSelect from './FolderSelect'
import PropertySelect, { SupportedType } from './PropertySelect'

const CreateDocActionConfigurator = ({
  configuration,
  onChange,
  eventType,
}: ActionConfiguratorProps) => {
  const eventDataOptions = useMemo(() => {
    return Object.fromEntries(
      Array.from(flattenType(eventType)).map(([path, type]) => [
        path.join('.'),
        type,
      ])
    )
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
          defaultValue=''
          onChange={(title) =>
            onChange(
              StructNode(
                title != null
                  ? { ...constructorTree, title }
                  : dissoc('title', title)
              )
            )
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormInput
                value={value?.value || ''}
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
          type='string'
          defaultValue=''
          onChange={(emoji) =>
            onChange(
              StructNode(
                emoji != null
                  ? { ...constructorTree, emoji }
                  : dissoc('emoji', constructorTree)
              )
            )
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormEmoji
                emoji={value?.value}
                defaultIcon={mdiFileDocumentOutline}
                setEmoji={(emojiStr) =>
                  onChange(
                    emojiStr != null
                      ? LiteralNode('string', emojiStr)
                      : undefined
                  )
                }
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Content' }}>
        <ActionConfigurationInput
          value={constructorTree.content}
          type='string'
          defaultValue=''
          onChange={(content) =>
            onChange(
              StructNode(
                content != null
                  ? { ...constructorTree, content }
                  : dissoc('content', constructorTree)
              )
            )
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormTextarea
                value={value?.value}
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
          defaultValue={undefined}
          onChange={(parentFolder) =>
            onChange(
              StructNode(
                parentFolder != null
                  ? { ...constructorTree, parentFolder }
                  : dissoc('parentFolder', constructorTree)
              )
            )
          }
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FolderSelect
                value={value?.value}
                onChange={(id) =>
                  onChange(id != null ? LiteralNode('folder', id) : undefined)
                }
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Props' }}></FormRow>
      <PropertySelect
        value={
          constructorTree.props != null &&
          constructorTree.props.type === 'constructor' &&
          constructorTree.props.info.type === 'record'
            ? constructorTree.props.info.refs.filter(isSupportedType)
            : []
        }
        onChange={(props) =>
          onChange(StructNode({ ...constructorTree, props: RecordNode(props) }))
        }
        eventDataOptions={eventDataOptions}
      />
    </div>
  )
}

function isSupportedType(x: {
  key: BoostAST
  val: BoostAST
}): x is SupportedType {
  return (
    x.key.type === 'literal' &&
    (x.val.type === 'operation' || x.val.type === 'literal')
  )
}

export default CreateDocActionConfigurator

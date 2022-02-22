import { mdiFileDocumentOutline } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import FormEmoji from '../../../../design/components/molecules/Form/atoms/FormEmoji'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import FormTextarea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import { BoostAST } from '../../../lib/automations'
import {
  ArrayNode,
  LiteralNode,
  RecordNode,
  StructNode,
} from '../../../lib/automations/ast'
import { flattenObj } from '../../../lib/utils/object'
import { ActionConfiguratorProps } from './'
import ActionConfigurationInput from './ActionConfigurationInput'
import PropertySelect, {
  PropertySelectProps,
  SupportedType,
} from './PropertySelect'

const UpdateDocActionConfigurator = ({
  configuration,
  onChange,
  eventType,
}: ActionConfiguratorProps) => {
  const eventDataOptions = useMemo(() => {
    return flattenObj(eventType as any)
  }, [eventType])

  const [propQueryNodes, contentNodes] = useMemo(() => {
    if (
      configuration.type !== 'constructor' ||
      configuration.info.type !== 'struct'
    ) {
      return [[], {}]
    }

    const propQueryAst =
      configuration.info.refs.query !== null &&
      configuration.info.refs.query.type === 'constructor' &&
      configuration.info.refs.query.info.type === 'array'
        ? configuration.info.refs.query.info.refs
        : []

    const contentAst =
      configuration.info.refs.content !== null &&
      configuration.info.refs.content.type === 'constructor' &&
      configuration.info.refs.content.info.type === 'struct'
        ? configuration.info.refs.content.info.refs
        : {}

    return [propQueryAst, contentAst]
  }, [configuration])

  const propArgs = useMemo(() => {
    return propQueryNodes.map(astToPropRef).filter(notNull)
  }, [propQueryNodes])

  const setContent = useCallback(
    (config: Record<string, BoostAST>) => {
      onChange(
        StructNode({
          query: ArrayNode(propQueryNodes),
          content: StructNode({
            ...contentNodes,
            ...config,
          }),
        })
      )
    },
    [propQueryNodes, contentNodes, onChange]
  )

  const setConditions: PropertySelectProps['onChange'] = useCallback(
    (props) => {
      onChange(
        StructNode({
          constent: StructNode({ ...contentNodes }),
          query: ArrayNode(
            props
              .map(({ key, val }) => {
                return toQueryAST(key, val)
              })
              .filter(notNull)
          ),
        })
      )
    },
    [contentNodes, onChange]
  )

  return (
    <div>
      <FormRow row={{ title: 'Prop Query' }} />
      <PropertySelect
        value={propArgs}
        onChange={setConditions}
        eventDataOptions={eventDataOptions}
      />
      <FormRow row={{ title: 'Title' }}>
        <ActionConfigurationInput
          value={contentNodes.title}
          onChange={(title) => setContent({ title })}
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
          value={contentNodes.emoji}
          onChange={(emoji) => setContent({ emoji })}
          eventDataOptions={eventDataOptions}
          customInput={(onChange, value) => {
            return (
              <FormEmoji
                emoji={value}
                defaultIcon={mdiFileDocumentOutline}
                setEmoji={(emoji) => onChange(LiteralNode('string', emoji))}
              />
            )
          }}
        />
      </FormRow>
      <FormRow row={{ title: 'Content' }}>
        <ActionConfigurationInput
          value={contentNodes.content}
          onChange={(content) => setContent({ content })}
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
      <FormRow row={{ title: 'Props' }} />
      <PropertySelect
        value={
          contentNodes.props.type === 'constructor' &&
          contentNodes.props.info.type === 'record'
            ? (contentNodes.props.info.refs as any)
            : {}
        }
        onChange={(props) => setContent({ props: RecordNode(props) })}
        eventDataOptions={eventDataOptions}
      />
    </div>
  )
}

export default UpdateDocActionConfigurator

function toQueryAST(
  name: SupportedType['key'],
  val: SupportedType['val']
): BoostAST | null {
  if (
    val.type === 'operation' &&
    val.input.type === 'constructor' &&
    val.input.info.type === 'struct'
  ) {
    return StructNode({
      type: LiteralNode('string', 'prop'),
      value: StructNode({
        name,
        type: val.input.info.refs.type,
        value: val.input.info.refs.data,
      }),
      rule: LiteralNode('string', 'and'),
    })
  }

  if (val.type === 'literal') {
    return StructNode({
      type: LiteralNode('string', 'prop'),
      value: StructNode({
        name,
        type: LiteralNode('string', val.value.type),
        value: LiteralNode('propData', val.value.data),
      }),
      rule: LiteralNode('string', 'and'),
    })
  }

  return null
}

function astToPropRef(
  ref: BoostAST
): PropertySelectProps['value'][number] | null {
  if (
    ref.type === 'constructor' &&
    ref.info.type === 'struct' &&
    ref.info.refs.value &&
    ref.info.refs.value != null &&
    ref.info.refs.value.type === 'constructor' &&
    ref.info.refs.value.info.type === 'struct' &&
    ref.info.refs.value.info.refs.name != null &&
    ref.info.refs.value.info.refs.name.type === 'literal' &&
    ref.info.refs.value.info.refs.value != null &&
    (ref.info.refs.value.info.refs.value.type === 'operation' ||
      ref.info.refs.value.info.refs.value.type === 'literal')
  ) {
    return {
      key: ref.info.refs.value.info.refs.name,
      val: ref.info.refs.value.info.refs.value,
    }
  }

  return null
}

function notNull<T>(x: T): x is Exclude<T, null | undefined> {
  return x != null
}

import { dissoc } from 'ramda'
import { mdiClose, mdiPlus } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import Button from '../../../../design/components/atoms/Button'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { getIconPathOfPropType } from '../../../lib/props'
import { PropPickerRaw } from '../../Props/PropPicker'
import PropRegisterCreationForm from '../../Props/PropRegisterModal/PropRegisterCreationForm'
import ActionConfigurationInput from './ActionConfigurationInput'
import { useModal } from '../../../../design/lib/stores/modal'
import { PropData } from '../../../interfaces/db/props'
import { BoostAST } from '../../../lib/automations'
import {
  LiteralNode,
  OpNode,
  RecordNode,
  StructNode,
} from '../../../lib/automations/ast'

export interface PropertySelectProps {
  value: BoostAST
  onChange: (props: BoostAST) => void
  eventDataOptions: Record<string, any>
}

type SupportedType = {
  key: Extract<BoostAST, { type: 'literal' }>
  val: Extract<BoostAST, { type: 'operation' } | { type: 'literal' }>
}

const PropertySelect = ({
  value,
  onChange,
  eventDataOptions,
}: PropertySelectProps) => {
  const { openContextModal } = useModal()

  const props = useMemo(() => {
    if (value.type !== 'constructor' || value.info.type !== 'record') {
      return []
    }
    return value.info.refs.filter(isSupported).map((ref) => {
      return { key: ref.key.value, val: ref.val }
    })
  }, [value])

  const addProp = useCallback(
    (key: string, val: SupportedType['val']) => {
      if (value.type !== 'constructor' || value.info.type !== 'record') {
        onChange(RecordNode([{ key: LiteralNode('string', key), val }]))
        return
      }

      onChange(
        RecordNode(
          value.info.refs
            .filter(
              (ref) => ref.key.type === 'literal' && key !== ref.key.value
            )
            .concat([{ key: LiteralNode('string', key), val }])
        )
      )
    },
    [value, onChange]
  )

  return (
    <>
      {props.map(({ key, val }, i) => {
        // if literal get type + data from value
        // else extrat type from subtype || type
        const [propType, subType] = getPropTypeFromAst(val)
        const iconPath = getIconPathOfPropType(subType || propType)
        return (
          <FormRow key={i}>
            <FormRowItem>
              <Button variant='transparent' size='sm' iconPath={iconPath}>
                {key}
              </Button>
            </FormRowItem>
            <FormRowItem>
              <ActionConfigurationInput
                value={val}
                type={getDataTypeForPropType(propType)}
                onChange={(data) => {
                  if (data.type === 'literal') {
                    addProp(key, data)
                  } else {
                    addProp(
                      key,
                      OpNode(
                        'boost.props.make',
                        StructNode(
                          subType != null
                            ? {
                                type: LiteralNode('string', propType),
                                subType: LiteralNode('string', subType),
                                data,
                              }
                            : {
                                type: LiteralNode('string', propType),
                                data,
                              }
                        )
                      ) as SupportedType['val']
                    )
                  }
                }}
                eventDataOptions={eventDataOptions}
                customInput={(onChange) => {
                  return (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <PropPickerRaw
                        propName={key}
                        propData={val.type === 'literal' ? val.value : null}
                        updateProp={(data) =>
                          onChange(LiteralNode('propData', data?.data))
                        }
                        disabled={false}
                        isLoading={false}
                        showIcon={true}
                      />
                    </div>
                  )
                }}
              />
            </FormRowItem>
            <FormRowItem>
              <Button
                iconPath={mdiClose}
                onClick={() => onChange(dissoc(key, value))}
              ></Button>
            </FormRowItem>
          </FormRow>
        )
      })}
      <FormRow>
        <Button
          variant='transparent'
          iconPath={mdiPlus}
          onClick={(event) => {
            openContextModal(
              event,
              <PropRegisterCreationForm
                onPropCreate={(prop) =>
                  addProp(
                    prop.name,
                    LiteralNode('propData', {
                      type: prop.type,
                      subType: prop.subType,
                      data: null,
                    }) as SupportedType['val']
                  )
                }
              />,

              {
                width: 200,
                alignment: 'right',
                removePadding: true,
                keepAll: true,
              }
            )
          }}
        >
          Add a property
        </Button>
      </FormRow>
    </>
  )
}

export default PropertySelect

function getDataTypeForPropType(type: PropData['type']): string | undefined {
  switch (type) {
    case 'number':
      return 'number'
    case 'string':
      return 'string'
    default:
      return undefined
  }
}

function isSupported(x: any): x is SupportedType {
  return (
    x.key.type === 'literal' &&
    x.key.def.def === 'string' &&
    ((x.val.type === 'literal' && x.val.def.def === 'propData') ||
      (x.val.type === 'operation' && x.val.identifier === 'boost.props.make'))
  )
}

function getPropTypeFromAst(x: SupportedType['val']) {
  if (x.type === 'literal') {
    return [x.value.subType, x.value.subType]
  }

  if (
    x.input.type === 'constructor' &&
    x.input.info.type === 'struct' &&
    x.input.info.refs.type != null &&
    x.input.info.refs.type.type === 'literal'
  ) {
    return [
      x.input.info.refs.type.value,
      x.input.info.refs.subType != null &&
      x.input.info.refs.subType.type === 'literal'
        ? x.input.info.refs.subType.value
        : undefined,
    ]
  }

  return []
}

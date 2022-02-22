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
import { BoostAST, BoostPrimitives } from '../../../lib/automations'
import { LiteralNode, OpNode, StructNode } from '../../../lib/automations/ast'
import { StdPrimitives } from '../../../lib/automations/types'

export interface PropertySelectProps {
  value: SupportedType[]
  onChange: (props: SupportedType[]) => void
  eventDataOptions: Record<string, any>
}

export type SupportedType = {
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
    return value.map((ref) => {
      return { key: ref.key.value, val: ref.val }
    })
  }, [value])

  const addProp = useCallback(
    (key: string, val: SupportedType['val']) => {
      onChange(
        value
          .filter((ref) => key !== ref.key.value)
          .concat([{ key: LiteralNode('string', key), val }])
      )
    },
    [value, onChange]
  )

  return (
    <>
      {props.map(({ key, val }, i) => {
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
                value={
                  val.type === 'operation' &&
                  val.input.type === 'constructor' &&
                  val.input.info.type === 'struct'
                    ? val.input.info.refs.data ||
                      LiteralNode('propData', { type: 'string', data: null })
                    : val
                }
                type={getDataTypeForPropType(propType)}
                defaultValue={{
                  type: propType,
                  subType,
                  data: null,
                }}
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
                      )
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
                        propData={
                          val.type === 'literal'
                            ? val.value
                            : {
                                type: propType,
                                subType,
                                data: null,
                              }
                        }
                        updateProp={(data) =>
                          onChange(LiteralNode('propData', data))
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
                onClick={() =>
                  onChange(value.filter((ref) => key !== ref.key.value))
                }
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

function getDataTypeForPropType(
  type: PropData['type']
): BoostPrimitives | StdPrimitives {
  switch (type) {
    case 'number':
    case 'status':
      return 'number'
    case 'string':
    default:
      return 'string'
  }
}

function getPropTypeFromAst(x: SupportedType['val']) {
  if (x.type === 'literal') {
    return [x.value.type, x.value.subType]
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

import { dissoc } from 'ramda'
import { mdiClose, mdiPlus } from '@mdi/js'
import React, { useMemo } from 'react'
import Button from '../../../../design/components/atoms/Button'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { getIconPathOfPropType } from '../../../lib/props'
import { PropPickerRaw } from '../../Props/PropPicker'
import PropRegisterCreationForm from '../../Props/PropRegisterModal/PropRegisterCreationForm'
import ActionConfigurationInput from './ActionConfigurationInput'
import { useModal } from '../../../../design/lib/stores/modal'
import { PropData } from '../../../interfaces/db/props'
import { SerializedPropData } from '../../../interfaces/db/props'

type PlaceholderPropData = Omit<PropData, 'data'> & {
  data: PropData['data'] | string
}

export interface PropertySelectProps {
  value: Record<string, PlaceholderPropData>
  onChange: (props: Record<string, PlaceholderPropData>) => void
  eventDataOptions: Record<string, any>
}

const PropertySelect = ({
  value,
  onChange,
  eventDataOptions,
}: PropertySelectProps) => {
  const { openContextModal } = useModal()

  const props = useMemo(() => {
    return Object.entries(value) as [string, SerializedPropData][]
  }, [value])

  return (
    <>
      {props.map(([propName, propData]) => {
        const iconPath = getIconPathOfPropType(
          propData.type === 'json' &&
            propData.data != null &&
            propData.data.dataType != null
            ? propData.data.dataType
            : propData.type
        )
        return (
          <FormRow key={propName}>
            <FormRowItem>
              <Button variant='transparent' size='sm' iconPath={iconPath}>
                {propName}
              </Button>
            </FormRowItem>
            <FormRowItem>
              <ActionConfigurationInput
                value={propData.data}
                type={getDataTypeForPropType(propData.type)}
                onChange={(data) =>
                  onChange({
                    ...value,
                    [propName]: { ...propData, data },
                  })
                }
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
                        propName={propName}
                        propData={propData}
                        updateProp={(data) => onChange(data?.data)}
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
                onClick={() => onChange(dissoc(propName, value))}
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
                  onChange({
                    ...value,
                    [prop.name]: { ...prop, data: null },
                  })
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

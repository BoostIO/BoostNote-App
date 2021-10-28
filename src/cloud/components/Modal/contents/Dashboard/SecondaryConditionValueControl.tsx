import React, { useState } from 'react'
import DocLabelSelect from './DocLabelSelect'
import DocAssigneeSelect from './DocAssigneeSelect'
import DocDateSelect, { DatePickerButton } from './DocDateSelect'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { EditableCondition, Kind } from './interfaces'
import FormSelect from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import { capitalize } from '../../../../lib/utils/string'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import FormDatePicker from '../../../../../design/components/molecules/Form/atoms/FormDatePicker'
import { isValid } from 'date-fns'
import { DateCondition } from '../../../../interfaces/db/dashboard'
import { PropType } from '../../../../interfaces/db/props'

interface ConditionValueControlProps {
  condition: EditableCondition
  update: (newCondition: EditableCondition) => void
}

const ConditionValueControl = ({
  condition,
  update,
}: ConditionValueControlProps) => {
  const [inputType, setInputType] = useState<PropType>('string')
  switch (condition.type) {
    case 'due_date':
    case 'creation_date':
    case 'update_date':
      const updateDateValue = (dateConditionValue: DateCondition | null) => {
        update({
          ...condition,
          value: dateConditionValue || { type: 'relative', period: 0 },
        })
      }
      return (
        <FormRowItem>
          <DocDateSelect value={condition.value} update={updateDateValue} />
        </FormRowItem>
      )
    case 'label':
      const updateLabels = (newLabel: string) => {
        update({
          ...condition,
          value: newLabel,
        })
      }
      return (
        <FormRowItem>
          <DocLabelSelect value={condition.value} update={updateLabels} />
        </FormRowItem>
      )
    case 'prop':
      const updateValue = (
        value: Partial<Kind<EditableCondition, 'prop'>['value']>
      ) => {
        update({
          ...condition,
          value: { ...condition.value, ...value },
        })
      }

      return (
        <>
          <FormRowItem>
            <FormInput
              value={condition.value.name}
              onChange={(ev) => updateValue({ name: ev.target.value })}
            />
          </FormRowItem>
          <FormRowItem>
            <FormSelect
              options={[
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Date', value: 'date' },
                { label: 'User', value: 'user' },
              ]}
              value={{
                label: capitalize(inputType),
                value: inputType,
              }}
              onChange={(val) => {
                setInputType(val.value)
                updateValue({ value: getDefaultPropValue(val.value) })
              }}
            />
          </FormRowItem>
          <FormRowItem>
            {inputType === 'user' && (
              <DocAssigneeSelect
                value={condition.value.value}
                update={(value) => updateValue({ value })}
              />
            )}
            {inputType === 'string' && (
              <FormInput
                value={condition.value.value}
                onChange={(ev) => updateValue({ value: ev.target.value })}
              />
            )}
            {inputType === 'number' && (
              <FormInput
                type='number'
                value={condition.value.value}
                onChange={(ev) => updateValue({ value: ev.target.value })}
              />
            )}
            {inputType === 'date' && (
              <FormDatePicker
                selected={
                  isValid(condition.value.value)
                    ? new Date(condition.value.value)
                    : null
                }
                onChange={(value) => updateValue({ value })}
                customInput={<DatePickerButton date={condition.value.value} />}
              />
            )}
          </FormRowItem>
        </>
      )
    case 'null':
    default:
      return null
  }
}

export default ConditionValueControl

function getDefaultPropValue(type: PropType) {
  switch (type) {
    case 'date':
      return new Date()
    case 'number':
      return 0
    default:
      return ''
  }
}

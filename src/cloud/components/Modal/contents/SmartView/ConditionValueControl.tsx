import React from 'react'
import DocLabelSelect from './DocLabelSelect'
import DocAssigneeSelect from './DocAssigneeSelect'
import DocDateSelect from './DocDateSelect'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { EditableCondition, Kind } from './interfaces'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import {
  DateCondition,
  PropCondition,
} from '../../../../interfaces/db/smartView'
import TimePeriodForm from './TimePeriodForm'

interface ConditionValueControlProps {
  condition: EditableCondition
  update: (newCondition: EditableCondition) => void
}

const ConditionValueControl = ({
  condition,
  update,
}: ConditionValueControlProps) => {
  console.log(condition)
  switch (condition.type) {
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
      const updateLabels = (newLabel: string[]) => {
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
          value: Object.assign(condition.value, value) as PropCondition,
        })
      }

      return (
        <>
          <FormRowItem flex='0 1 180px'>
            <FormInput
              value={condition.value.name}
              onChange={(ev) => updateValue({ name: ev.target.value })}
              placeholder='Property name..'
            />
          </FormRowItem>
          <FormRowItem>
            {condition.value.type === 'user' && (
              <DocAssigneeSelect
                value={condition.value.value}
                update={(value) => updateValue({ value })}
              />
            )}
            {condition.value.type === 'string' && (
              <FormInput
                value={condition.value.value}
                onChange={(ev) => updateValue({ value: ev.target.value })}
                placeholder='Property value..'
              />
            )}
            {condition.value.type === 'number' && (
              <FormInput
                type='number'
                value={condition.value.value.toString()}
                onChange={(ev) =>
                  updateValue({ value: parseInt(ev.target.value) })
                }
                placeholder='Property value..'
              />
            )}
            {condition.value.type === 'json' &&
              condition.value.value.type === 'timeperiod' && (
                <TimePeriodForm
                  period={condition.value.value.value}
                  updatePeriod={(period) => {
                    updateValue({
                      value: { type: 'timeperiod', value: period },
                    })
                  }}
                />
              )}
            {condition.value.type === 'date' && (
              <DocDateSelect
                value={condition.value.value}
                usePortal={false}
                update={(value) => {
                  updateValue({
                    value:
                      value == null ? { type: 'relative', period: 0 } : value,
                  })
                }}
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

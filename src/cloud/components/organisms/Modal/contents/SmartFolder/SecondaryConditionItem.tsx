import React from 'react'
import { mdiPlus, mdiMinus } from '@mdi/js'
import {
  EditibleSecondaryCondition,
  StatusCondition,
  LabelsCondition,
  EditibleDueDateCondition,
  EditibleCreationDateCondition,
  EditibleUpdateDateCondition,
  EditibleSecondaryConditionType,
  AssigneesCondition,
} from './interfaces'
import SecondaryConditionValueControl from './SecondaryConditionValueControl'
import FormSelect from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import Button from '../../../../../../shared/components/atoms/Button'

interface SecondaryConditionItemProps {
  condition: EditibleSecondaryCondition
  update: (newSecondaryCondition: EditibleSecondaryCondition) => void
  addNext: () => void
  remove: () => void
}

const SecondaryConditionItem = ({
  condition,
  update,
  addNext,
  remove,
}: SecondaryConditionItemProps) => {
  return (
    <div className='form__row'>
      <div className='form__row__items'>
        <div className='form__row__item form__row__item--shrink'>
          <FormSelect
            value={getSecondaryConditionOptionByType(condition.type)}
            options={([
              'status',
              'labels',
              'due_date',
              'assignees',
              'creation_date',
              'update_date',
            ] as EditibleSecondaryConditionType[]).map(
              getSecondaryConditionOptionByType
            )}
            minWidth='140px'
            onChange={(selectedOption: {
              label: string
              value: EditibleSecondaryConditionType
            }) => {
              const newSecondaryCondition = getDefaultEditibleSecondaryConditionByType(
                selectedOption.value
              )

              update(newSecondaryCondition)
            }}
          />
        </div>

        <SecondaryConditionValueControl condition={condition} update={update} />

        <div className='form__row__item'></div>
        <div className='form__row__item form__row__item--shrink'>
          <Button variant='secondary' iconPath={mdiPlus} onClick={addNext} />
          <Button variant='secondary' iconPath={mdiMinus} onClick={remove} />
        </div>
      </div>
    </div>
  )
}

export default SecondaryConditionItem

function getSecondaryConditionOptionByType(
  value: EditibleSecondaryConditionType
) {
  switch (value) {
    case 'status':
      return { label: 'Status', value: 'status' }
    case 'labels':
      return { label: 'Labels', value: 'labels' }
    case 'due_date':
      return { label: 'Due Date', value: 'due_date' }
    case 'assignees':
      return { label: 'Assignees', value: 'assignees' }
    case 'creation_date':
      return { label: 'Creation Date', value: 'creation_date' }
    case 'update_date':
      return { label: 'Update Date', value: 'update_date' }
    case 'null':
    default:
      return { label: 'Select', value: 'null' }
  }
}

function getDefaultEditibleSecondaryConditionByType(
  type: string
): EditibleSecondaryCondition {
  switch (type) {
    case 'status':
      return {
        type: 'status',
        value: 'in_progress',
      } as StatusCondition
    case 'labels':
      return {
        type: 'labels',
        value: [],
      } as LabelsCondition
    case 'assignees':
      return {
        type: 'assignees',
        value: [],
      } as AssigneesCondition
    case 'due_date':
      return {
        type: 'due_date',
        value: {
          type: 'today',
        },
      } as EditibleDueDateCondition
    case 'creation_date':
      return {
        type: 'creation_date',
        value: {
          type: 'today',
        },
      } as EditibleCreationDateCondition
    case 'update_date':
      return {
        type: 'update_date',
        value: {
          type: 'today',
        },
      } as EditibleUpdateDateCondition
    case 'null':
    default:
      return {
        type: 'null',
      }
  }
}

import React from 'react'
import { mdiPlus, mdiMinus } from '@mdi/js'
import {
  StatusCondition,
  LabelsCondition,
  AssigneesCondition,
} from '../../../../interfaces/db/smartFolder'
import {
  EditibleSecondaryCondition,
  EditibleDueDateCondition,
  EditibleCreationDateCondition,
  EditibleUpdateDateCondition,
  EditibleSecondaryConditionType,
} from './interfaces'
import SecondaryConditionValueControl from './SecondaryConditionValueControl'
import Button from '../../../../../design/components/atoms/Button'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { TFunction } from 'i18next'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'

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
  const { translate } = useI18n()
  const validConditions = [
    'status',
    'labels',
    'due_date',
    'assignees',
    'creation_date',
    'update_date',
  ]

  return (
    <FormRow fullWidth={true}>
      <FormRowItem
        className='form__row__item--shrink'
        item={{
          type: 'select',
          props: {
            value: getSecondaryConditionOptionByType(translate, condition.type),
            options: (validConditions as EditibleSecondaryConditionType[]).map(
              (condition) =>
                getSecondaryConditionOptionByType(translate, condition)
            ),
            minWidth: 140,
            onChange: (selectedOption: {
              label: string
              value: EditibleSecondaryConditionType
            }) => {
              const newSecondaryCondition = getDefaultEditibleSecondaryConditionByType(
                selectedOption.value
              )
              update(newSecondaryCondition)
            },
          },
        }}
      />
      <SecondaryConditionValueControl condition={condition} update={update} />
      <FormRowItem />
      <FormRowItem className='form__row__item--shrink'>
        <Button variant='secondary' iconPath={mdiPlus} onClick={addNext} />
        <Button variant='secondary' iconPath={mdiMinus} onClick={remove} />
      </FormRowItem>
    </FormRow>
  )
}

export default SecondaryConditionItem

function getSecondaryConditionOptionByType(
  t: TFunction,
  value: EditibleSecondaryConditionType
) {
  switch (value) {
    case 'status':
      return { label: t(lngKeys.GeneralStatus), value: 'status' }
    case 'labels':
      return { label: t(lngKeys.GeneralLabels), value: 'labels' }
    case 'due_date':
      return { label: t(lngKeys.DueDate), value: 'due_date' }
    case 'assignees':
      return { label: t(lngKeys.Assignees), value: 'assignees' }
    case 'creation_date':
      return { label: t(lngKeys.CreationDate), value: 'creation_date' }
    case 'update_date':
      return { label: t(lngKeys.UpdateDate), value: 'update_date' }
    case 'null':
    default:
      return { label: t(lngKeys.GeneralSelectVerb), value: 'null' }
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

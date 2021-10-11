import React from 'react'
import {
  EditibleSecondaryCondition,
  EditibleDateConditionValue,
} from './interfaces'
import DocStatusSelect from './DocStatusSelect'
import { DocStatus } from '../../../../interfaces/db/doc'
import DocLabelSelect from './DocLabelSelect'
import DocAssigneeSelect from './DocAssigneeSelect'
import DocDateSelect from './DocDateSelect'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'

interface SecondaryConditionValueControlProps {
  condition: EditibleSecondaryCondition
  update: (newCondition: EditibleSecondaryCondition) => void
}

const SecondaryConditionccValueControl = ({
  condition,
  update,
}: SecondaryConditionValueControlProps) => {
  switch (condition.type) {
    case 'due_date':
    case 'creation_date':
    case 'update_date':
      const updateDateValue = (
        dateConditionValue: EditibleDateConditionValue | null
      ) => {
        update({
          type: condition.type,
          value: dateConditionValue,
        })
      }
      return (
        <FormRowItem className='form__row__item--shrink'>
          <DocDateSelect value={condition.value} update={updateDateValue} />
        </FormRowItem>
      )
    case 'labels':
      const updateLabels = (newLabels: string[]) => {
        update({
          type: 'labels',
          value: newLabels,
        })
      }
      return (
        <FormRowItem>
          <DocLabelSelect value={condition.value} update={updateLabels} />
        </FormRowItem>
      )
    case 'status':
      const updateDocStatus = (docStatus: DocStatus) => {
        update({
          type: 'status',
          value: docStatus,
        })
      }
      return (
        <FormRowItem className='form__row__item--shrink'>
          <DocStatusSelect value={condition.value} update={updateDocStatus} />
        </FormRowItem>
      )
    case 'assignees':
      const updateDocAssignees = (docAssignees: string[]) => {
        update({
          type: 'assignees',
          value: docAssignees,
        })
      }

      return (
        <FormRowItem>
          <DocAssigneeSelect
            value={condition.value}
            update={updateDocAssignees}
          />
        </FormRowItem>
      )
    case 'null':
    default:
      return null
  }
}

export default SecondaryConditionccValueControl

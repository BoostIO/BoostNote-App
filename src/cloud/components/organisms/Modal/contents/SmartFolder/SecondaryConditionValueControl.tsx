import React from 'react'
import { EditibleSecondaryCondition, DateConditionValue } from './interfaces'
import DocStatusSelect from './DocStatusSelect'
import { DocStatus } from '../../../../../interfaces/db/doc'
import DocLabelSelect from './DocLabelSelect'
import DocAssigneeSelect from './DocAssigneeSelect'
import DocDateSelect from './DocDateSelect'

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
      const updateDateValue = (dateConditionValue: DateConditionValue) => {
        update({
          type: condition.type,
          value: dateConditionValue,
        })
      }
      return (
        <div className='form__row__item form__row__item--shrink form__row__item form__row__item--align-items-center'>
          <DocDateSelect value={condition.value} update={updateDateValue} />
        </div>
      )
    case 'labels':
      const updateLabels = (newLabels: string[]) => {
        update({
          type: 'labels',
          value: newLabels,
        })
      }
      return (
        <div className='form__row__item'>
          <DocLabelSelect value={condition.value} update={updateLabels} />
        </div>
      )
    case 'status':
      const updateDocStatus = (docStatus: DocStatus) => {
        update({
          type: 'status',
          value: docStatus,
        })
      }
      return (
        <div className='form__row__item form__row__item--shrink'>
          <DocStatusSelect value={condition.value} update={updateDocStatus} />
        </div>
      )
    case 'assignees':
      const updateDocAssignees = (docAssignees: string[]) => {
        update({
          type: 'assignees',
          value: docAssignees,
        })
      }

      return (
        <div className='form__row__item'>
          <DocAssigneeSelect
            value={condition.value}
            update={updateDocAssignees}
          />
        </div>
      )
    case 'null':
    default:
      return null
  }
}

export default SecondaryConditionccValueControl

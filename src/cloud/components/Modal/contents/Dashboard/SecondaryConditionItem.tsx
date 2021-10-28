import React from 'react'
import { mdiTrashCanOutline } from '@mdi/js'
import SecondaryConditionValueControl from './SecondaryConditionValueControl'
import Button from '../../../../../design/components/atoms/Button'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { TFunction } from 'i18next'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { EditableCondition } from './interfaces'

const SUPPORTED_CONDTION_TYPES = [
  'null',
  'label',
  'due_date',
  'creation_date',
  'update_date',
  'prop',
  //'query',
] as const

interface SecondaryConditionItemProps {
  condition: EditableCondition
  update: (newSecondaryCondition: EditableCondition) => void
  addNext: () => void
  remove: () => void
}

const SecondaryConditionItem = ({
  condition,
  update,
  remove,
}: SecondaryConditionItemProps) => {
  const { translate } = useI18n()
  return (
    <FormRow fullWidth={true}>
      <FormRowItem
        item={{
          type: 'select',
          props: {
            minWidth: 140,
            value: getPrimaryConditionOptionByType(translate, condition.rule),
            options: [
              getPrimaryConditionOptionByType(translate, 'and'),
              getPrimaryConditionOptionByType(translate, 'or'),
            ],
            onChange: (selectedOption: { value: 'and' | 'or' }) => {
              update({ ...condition, rule: selectedOption.value })
            },
          },
        }}
      />
      <FormRowItem
        item={{
          type: 'select',
          props: {
            value: getSecondaryConditionOptionByType(translate, condition.type),
            options: SUPPORTED_CONDTION_TYPES.map((condition) =>
              getSecondaryConditionOptionByType(translate, condition)
            ),
            minWidth: 140,
            onChange: (selectedOption: {
              label: string
              value: typeof SUPPORTED_CONDTION_TYPES[number]
            }) => {
              const newSecondaryCondition =
                getDefaultEditibleSecondaryConditionByType(selectedOption.value)
              update(newSecondaryCondition)
            },
          },
        }}
      />
      <SecondaryConditionValueControl condition={condition} update={update} />
      <FormRowItem />
      <FormRowItem>
        <Button
          variant='transparent'
          iconPath={mdiTrashCanOutline}
          onClick={remove}
        />
      </FormRowItem>
    </FormRow>
  )
}

export default SecondaryConditionItem

function getSecondaryConditionOptionByType(
  t: TFunction,
  value: EditableCondition['type']
) {
  switch (value) {
    case 'label':
      return { label: t(lngKeys.GeneralLabels), value: 'label' }
    case 'due_date':
      return { label: t(lngKeys.DueDate), value: 'due_date' }
    case 'creation_date':
      return { label: t(lngKeys.CreationDate), value: 'creation_date' }
    case 'update_date':
      return { label: t(lngKeys.UpdateDate), value: 'update_date' }
    case 'prop':
      return { label: 'Prop', value: 'prop' }
    case 'null':
    default:
      return { label: t(lngKeys.GeneralSelectVerb), value: 'null' }
  }
}

function getDefaultEditibleSecondaryConditionByType(
  type: string
): EditableCondition {
  switch (type) {
    case 'prop':
      return {
        rule: 'and',
        type: 'prop',
        value: { name: '', value: '' },
      }
    case 'label':
      return {
        rule: 'and',
        type: 'label',
        value: '',
      }
    case 'due_date':
    case 'creation_date':
    case 'update_date':
      return {
        rule: 'and',
        type,
        value: {
          type: 'relative',
          period: 0,
        },
      }
    case 'null':
    default:
      return {
        type: 'null',
        rule: 'and',
      }
  }
}

function getPrimaryConditionOptionByType(_t: TFunction, value: 'and' | 'or') {
  switch (value) {
    case 'and':
      return { label: 'AND', value: 'and' }
    case 'or':
      return { label: 'OR', value: 'or' }
  }
}

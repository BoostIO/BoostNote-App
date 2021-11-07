import React from 'react'
import { mdiTrashCanOutline } from '@mdi/js'
import Button from '../../../../../design/components/atoms/Button'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { TFunction } from 'i18next'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { EditableCondition } from './interfaces'
import ConditionValueControl from './ConditionValueControl'
import Flexbox from '../../../../../design/components/atoms/Flexbox'

const SUPPORTED_CONDTION_TYPES = [
  'label',
  'due_date',
  'creation_date',
  'update_date',
  'prop',
  //'query',
] as const

interface ConditionItemProps {
  hideConditionRuleType: boolean
  condition: EditableCondition
  update: (newCondition: EditableCondition) => void
  remove: () => void
}

const ConditionItem = ({
  condition,
  hideConditionRuleType,
  update,
  remove,
}: ConditionItemProps) => {
  const { translate } = useI18n()
  return (
    <FormRow fullWidth={true}>
      <Flexbox flex='1 1 auto'>
        {hideConditionRuleType ? (
          <FormRowItem item={{ type: 'node', element: <span>WHERE</span> }} />
        ) : (
          <FormRowItem
            item={{
              type: 'select',
              props: {
                minWidth: 140,
                value: getRuleOptionByType(translate, condition.rule),
                options: [
                  getRuleOptionByType(translate, 'and'),
                  getRuleOptionByType(translate, 'or'),
                ],
                onChange: (selectedOption: { value: 'and' | 'or' }) => {
                  update({ ...condition, rule: selectedOption.value })
                },
              },
            }}
          />
        )}
        <FormRowItem
          item={{
            type: 'select',
            props: {
              value: getConditionOptionByType(translate, condition.type),
              options: SUPPORTED_CONDTION_TYPES.map((condition) =>
                getConditionOptionByType(translate, condition)
              ),
              minWidth: 140,
              onChange: (selectedOption: {
                label: string
                value: typeof SUPPORTED_CONDTION_TYPES[number]
              }) => {
                update(
                  getDefaultConditionByType(
                    selectedOption.value,
                    condition.rule
                  )
                )
              },
            },
          }}
        />
        <ConditionValueControl condition={condition} update={update} />
        <FormRowItem />
      </Flexbox>
      <Flexbox flex='0 0 auto'>
        <FormRowItem>
          <Button
            variant='transparent'
            iconPath={mdiTrashCanOutline}
            onClick={remove}
          />
        </FormRowItem>
      </Flexbox>
    </FormRow>
  )
}

export default ConditionItem

function getConditionOptionByType(
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
      return { label: 'Select condition..', value: 'null' }
  }
}

function getDefaultConditionByType(
  type: string,
  rule: 'and' | 'or'
): EditableCondition {
  switch (type) {
    case 'prop':
      return {
        rule,
        type: 'prop',
        value: { name: '', value: '' },
      }
    case 'label':
      return {
        rule,
        type: 'label',
        value: [],
      }
    case 'due_date':
    case 'creation_date':
    case 'update_date':
      return {
        rule,
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
        rule,
      }
  }
}

function getRuleOptionByType(_t: TFunction, value: 'and' | 'or') {
  switch (value) {
    case 'and':
      return { label: 'AND', value: 'and' }
    case 'or':
      return { label: 'OR', value: 'or' }
  }
}

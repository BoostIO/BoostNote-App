import { mdiPlus } from '@mdi/js'
import React, { useCallback } from 'react'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import ConditionItem from './ConditionItem'
import { EditableCondition, EditableQuery } from './interfaces'

interface DashboardConditionRowsProps {
  conditions: EditableQuery
  setConditions: React.Dispatch<React.SetStateAction<EditableQuery>>
}

const DashboardConditionRows = ({
  conditions,
  setConditions,
}: DashboardConditionRowsProps) => {
  const removeConditionByIndex = useCallback(
    (index: number) => {
      setConditions((previousConditions) => {
        const newConditions = [...previousConditions]
        newConditions.splice(index, 1)
        return newConditions
      })
    },
    [setConditions]
  )

  return (
    <>
      {conditions.map((condition, index) => {
        const updateCondition = (updatedCondition: EditableCondition) => {
          setConditions((previousConditions) => {
            const newConditions = [...previousConditions]
            newConditions.splice(index, 1, updatedCondition)
            return newConditions
          })
        }

        const removeCondition = () => {
          removeConditionByIndex(index)
        }

        return (
          <ConditionItem
            key={index}
            condition={condition}
            update={updateCondition}
            remove={removeCondition}
            hideConditionRuleType={index === 0}
          />
        )
      })}

      <FormRow>
        <FormRowItem
          item={{
            type: 'button',
            props: {
              iconPath: mdiPlus,
              variant: 'transparent',
              label: 'Add a filter',
              onClick: () =>
                setConditions((prev) => [
                  ...prev,
                  { type: 'null', rule: 'and' },
                ]),
            },
          }}
        />
      </FormRow>
    </>
  )
}

export default DashboardConditionRows

import { assocPath, dissocPath } from 'ramda'
import React, { useCallback, useMemo, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect, {
  FormSelectOption,
} from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import { SerializedPipe } from '../../interfaces/db/automations'
import { JsonTypeDef } from '../../lib/automations/events'
import { flattenObj } from '../../lib/utils/object'

interface FilterBuilderProps {
  typeDef: JsonTypeDef
  filter: SerializedPipe['filter']
  onChange: (filter: SerializedPipe['filter']) => void
}

const FilterBuilder = ({ typeDef, filter, onChange }: FilterBuilderProps) => {
  const [selected, setSelected] = useState<FormSelectOption | undefined>()
  const [addingValue, setAddingValue] = useState('')

  const flattenedTypeKeys = useMemo(
    () =>
      Object.keys(flattenObj(typeDef as any)).map((key) => ({
        label: key,
        value: key,
      })),
    [typeDef]
  )

  const flattenedFilter = useMemo(() => flattenObj(filter), [filter])

  const addFilter = useCallback(() => {
    if (selected != null) {
      onChange(assocPath(selected.value.split('.'), addingValue, filter))
    }
  }, [filter, selected, addingValue, onChange])

  const removeFilter = useCallback(
    (key: string) => {
      onChange(dissocPath(key.split('.'), filter))
    },
    [filter, onChange]
  )

  return (
    <div>
      {Object.entries(flattenedFilter).map(([key, val]) => {
        return (
          <div key={key}>
            {key}: {val} <Button onClick={() => removeFilter(key)}>-</Button>
          </div>
        )
      })}
      <FormRow>
        <FormRowItem>
          <FormSelect
            value={selected}
            options={flattenedTypeKeys}
            onChange={setSelected}
          />
        </FormRowItem>
        <FormRowItem>
          <FormInput
            value={addingValue}
            onChange={(ev) => setAddingValue(ev.target.value)}
          />
        </FormRowItem>
      </FormRow>
      <FormRow>
        <FormRowItem>
          <Button onClick={addFilter}>Add Filter</Button>
        </FormRowItem>
      </FormRow>
    </div>
  )
}

export default FilterBuilder

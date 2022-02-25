import { mdiClose, mdiPlus } from '@mdi/js'
import { assocPath, dissocPath } from 'ramda'
import React, { useCallback, useMemo, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Switch from '../../../design/components/atoms/Switch'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect, {
  FormSelectOption,
} from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import { SerializedPipe } from '../../interfaces/db/automations'
import { BoostType } from '../../lib/automations'
import { flattenType } from '../../lib/automations/types'
import { flattenObj } from '../../lib/utils/object'

interface FilterBuilderProps {
  typeDef: BoostType
  filter: SerializedPipe['filter']
  onChange: (filter: SerializedPipe['filter']) => void
}

const FilterBuilder = ({ typeDef, filter, onChange }: FilterBuilderProps) => {
  const [selected, setSelected] = useState<
    (FormSelectOption & { type: string }) | null
  >(null)
  const [addingValue, setAddingValue] = useState<
    string | number | boolean | undefined
  >()

  const flattenedTypeKeys = useMemo(() => {
    const supportedPrimitives = new Set(['number', 'string', 'boolean'])
    return Array.from(flattenType(typeDef))
      .filter(
        ([, type]) =>
          type.type === 'primitive' && supportedPrimitives.has(type.def)
      )
      .map(([path, type]) => [path.join('.'), type] as const)
      .map(([key, val]) => ({
        label: key,
        value: key,
        type: val.def,
      }))
  }, [typeDef])

  const flattenedFilter = useMemo(() => flattenObj(filter), [filter])

  const addFilter = useCallback(() => {
    if (selected != null) {
      onChange(assocPath(selected.value.split('.'), addingValue, filter))
      setAddingValue('')
      setSelected(null)
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
          <FormRow key={key}>
            <FormRowItem>
              <FormInput readOnly={true} value={`${key}: ${val}`} />
            </FormRowItem>
            <FormRowItem>
              <Button
                onClick={() => removeFilter(key)}
                iconPath={mdiClose}
              ></Button>
            </FormRowItem>
          </FormRow>
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
          {selected != null && selected.type === 'boolean' ? (
            <Switch checked={!!addingValue} onChange={setAddingValue} />
          ) : (
            <FormInput
              type={
                selected != null && selected.type === 'number'
                  ? 'number'
                  : 'text'
              }
              value={addingValue?.toString()}
              onChange={(ev) => setAddingValue(ev.target.value)}
            />
          )}
        </FormRowItem>
        <FormRowItem>
          <Button onClick={addFilter} iconPath={mdiPlus}></Button>
        </FormRowItem>
      </FormRow>
    </div>
  )
}

export default FilterBuilder

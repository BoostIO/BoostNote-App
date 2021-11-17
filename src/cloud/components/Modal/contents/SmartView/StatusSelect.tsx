import React, { useMemo } from 'react'
import FormSelect from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import { usePage } from '../../../../lib/stores/pageStore'
import { useStatuses } from '../../../../lib/stores/status'
import { StatusView } from '../../../Props/Pickers/StatusSelect'

interface StatusSelectProps {
  value: number
  update: (value: number) => void
  isDisabled?: boolean
  placeholder?: string
}

const NO_STATUS = {
  label: <StatusView name={'No Status'} />,
  value: 'none',
}

const StatusSelect = ({
  value,
  update,
  isDisabled,
  placeholder,
}: StatusSelectProps) => {
  const { team } = usePage()
  const { state } = useStatuses(team!.id)

  const options = useMemo(() => {
    const statuses = state.statuses.map((status) => ({
      label: (
        <StatusView
          name={status.name}
          backgroundColor={status.backgroundColor}
        />
      ),
      value: status.id.toString(),
    }))
    return [NO_STATUS].concat(statuses)
  }, [state.statuses])

  const selectValue = useMemo(() => {
    if (value === -1) {
      return NO_STATUS
    }
    return options.find((option) => option.value === value.toString())
  }, [options, value])

  return (
    <FormSelect
      value={selectValue}
      onChange={(val) => update(val.value === 'none' ? -1 : Number(val.value))}
      options={options}
      placeholder={placeholder}
      isLoading={state.isWorking}
      isDisabled={isDisabled}
    />
  )
}

export default StatusSelect

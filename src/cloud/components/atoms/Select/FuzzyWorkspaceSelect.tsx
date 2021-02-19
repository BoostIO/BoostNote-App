import React, { useMemo, useState } from 'react'
import { useNav } from '../../../lib/stores/nav'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import CustomSelect, { CustomSelectOption } from './CustomSelect'

interface FuzzyWorkspaceSelectProps {
  selectedOption?: CustomSelectOption
  isLoading?: boolean
  isSearchable?: boolean
  name: string
  onChange: (val: any) => void
}

const FuzzyWorkspaceSelect = ({
  selectedOption,
  isLoading = false,
  isSearchable = true,
  name,
  onChange,
}: FuzzyWorkspaceSelectProps) => {
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const { workspacesMap } = useNav()

  const workspaces = useMemo(() => {
    return [...workspacesMap.values()]
  }, [workspacesMap])

  const customSelectOptions: CustomSelectOption[] = useMemo(() => {
    const options: CustomSelectOption[] = []
    setLoadingOptions(true)
    workspaces.forEach((workspace) => {
      options.push(getSelectOptionFromWorkspace(workspace))
    })

    setLoadingOptions(false)
    return sortOptionsByData(options)
  }, [workspaces])

  const customFilterOption = (option: CustomSelectOption, rawInput: string) => {
    const words = rawInput.split(/[\s\/]+/)
    return words.reduce(
      (acc, cur) =>
        acc &&
        (option.label as string).toLowerCase().includes(cur.toLowerCase()),
      true
    )
  }

  return (
    <CustomSelect
      options={customSelectOptions}
      value={selectedOption}
      isLoading={isLoading || loadingOptions}
      isDisabled={isLoading || loadingOptions}
      isSearchable={isSearchable}
      filterOption={customFilterOption}
      className='rc-select'
      classNamePrefix='select'
      name={name}
      onChange={onChange}
    />
  )
}

export function getSelectOptionFromWorkspace(workspace: SerializedWorkspace) {
  return {
    label: workspace.name,
    data: workspace.name,
    value: workspace.id,
  }
}

function sortOptionsByData(options: CustomSelectOption[]) {
  return options.sort((a, b) => {
    if (a.data < b.data) {
      return -1
    } else {
      return 1
    }
  })
}

export default FuzzyWorkspaceSelect

import React, { useMemo, useState } from 'react'
import { useNav } from '../../../lib/stores/nav'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import CustomSelect, { CustomSelectOption } from './CustomSelect'

interface FuzzyFolderSelectProps {
  workspaceId?: string
  selectedOption: CustomSelectOption
  filteredOutPathname?: string
  isLoading?: boolean
  isSearchable?: boolean
  isDisabled?: boolean
  name: string
  onChange: (val: any) => void
}

export const rootOption: CustomSelectOption = {
  label: '/',
  value: '',
  data: '/',
}

const FuzzyFolderSelect = ({
  selectedOption,
  filteredOutPathname,
  isLoading = false,
  isSearchable = true,
  isDisabled = false,
  name,
  workspaceId,
  onChange,
}: FuzzyFolderSelectProps) => {
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const { foldersMap } = useNav()

  const parentFolders = useMemo(() => {
    return [...foldersMap.values()]
  }, [foldersMap])

  const customSelectOptions: CustomSelectOption[] = useMemo(() => {
    const options: CustomSelectOption[] = [rootOption]
    setLoadingOptions(true)
    parentFolders.forEach((parentFolder) => {
      if (parentFolder.workspaceId === workspaceId) {
        options.push(getSelectOptionFromFolder(parentFolder))
      }
    })

    setLoadingOptions(false)
    if (filteredOutPathname == null) {
      return sortOptionsByPathname(options)
    }

    return sortOptionsByPathname(
      options.filter((option) => !option.data.startsWith(filteredOutPathname))
    )
  }, [parentFolders, filteredOutPathname, workspaceId])

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
      isDisabled={isLoading || loadingOptions || isDisabled}
      isSearchable={isSearchable}
      filterOption={customFilterOption}
      className='rc-select'
      classNamePrefix='select'
      name={name}
      onChange={onChange}
    />
  )
}

export function getSelectOptionFromFolder(
  folder: SerializedFolderWithBookmark
) {
  return {
    label: folder.pathname,
    data: folder.pathname,
    value: folder.id,
  }
}

function sortOptionsByPathname(options: CustomSelectOption[]) {
  return options.sort((a, b) => {
    if (a.data < b.data) {
      return -1
    } else {
      return 1
    }
  })
}

export default FuzzyFolderSelect

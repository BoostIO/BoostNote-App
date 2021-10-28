import React, { useMemo, useCallback } from 'react'
import { useNav } from '../../../../lib/stores/nav'
import { SerializedTag } from '../../../../interfaces/db/tag'
import FormSelect, {
  FormSelectOption,
} from '../../../../../design/components/molecules/Form/atoms/FormSelect'

interface DocLabelSelect {
  value: string
  update: (newLabels: string) => void
}

const DocLabelSelect = ({ value, update }: DocLabelSelect) => {
  const { tagsMap } = useNav()

  const options = useMemo(() => {
    return [...tagsMap].map(([_id, tag]) => getOptionByTag(tag))
  }, [tagsMap])

  const updateTag = useCallback(
    (option: FormSelectOption) => update(option.value),
    [update]
  )

  const optionValue = useMemo(() => {
    return getOptionByTagName(value, tagsMap)
  }, [value, tagsMap])

  return (
    <FormSelect
      isMulti={false}
      options={options}
      value={optionValue}
      onChange={updateTag}
    />
  )
}

export default DocLabelSelect

function getOptionByTag(tag: SerializedTag) {
  return {
    label: tag.text,
    value: tag.id,
  }
}

function getOptionByTagName(
  tagId: string,
  tagsMap: Map<string, SerializedTag>
) {
  const tag = tagsMap.get(tagId)
  if (tag == null) {
    return undefined
  }

  return {
    label: tag.text,
    value: tag.id,
  }
}

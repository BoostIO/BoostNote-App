import React, { useMemo, useCallback } from 'react'
import { useNav } from '../../../../../lib/stores/nav'
import { SerializedTag } from '../../../../../interfaces/db/tag'
import FormSelect, {
  FormSelectOption,
} from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'

interface DocLabelSelect {
  value: string[]
  update: (newLabels: string[]) => void
}

const DocLabelSelect = ({ value, update }: DocLabelSelect) => {
  const { tagsMap } = useNav()

  const options = useMemo(() => {
    return [...tagsMap].map(([_id, tag]) => getOptionByTag(tag))
  }, [tagsMap])

  const updateTag = useCallback(
    (options: FormSelectOption[]) => {
      update(options.map((option) => option.value))
    },
    [update]
  )

  return (
    <FormSelect
      isMulti
      options={options}
      value={value.map(getOptionByTagName)}
      onChange={updateTag}
    />
  )
}

export default DocLabelSelect

function getOptionByTag(tag: SerializedTag) {
  return {
    label: tag.text,
    value: tag.text,
  }
}

function getOptionByTagName(tagName: string) {
  return {
    label: tagName,
    value: tagName,
  }
}

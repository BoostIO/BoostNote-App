import React, { useCallback, useMemo, useState } from 'react'
import { SearchableListOption } from '../../../../design/components/molecules/SearchableOptionList'
import styled from '../../../../design/lib/styled'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import {
  getMapValues,
  sortByAttributeAsc,
} from '../../../../design/lib/utils/array'
import { useNav } from '../../../lib/stores/nav'
import SearchableOptionListPopup from '../../SearchableOptionListPopup'

interface DocLabelSelectionModalProps {
  selectedTags: string[]
  sendTags: (tags: string[]) => void
}

interface SelectionTag {
  isNew?: boolean
  text: string
}

const DocLabelSelectionModal = ({
  selectedTags,
  sendTags,
}: DocLabelSelectionModalProps) => {
  const { tagsMap } = useNav()
  const [query, setQuery] = useState<string>('')
  const [selected, setSelected] = useState<SelectionTag[]>(
    selectedTags.map((tag) => {
      return { text: tag }
    })
  )

  const availableTags = useMemo(() => {
    return getMapValues(tagsMap)
  }, [tagsMap])

  const searchedTagIsNew = useMemo(() => {
    const trimmed = query.trim()
    if (trimmed === '') return
    return (
      availableTags.find((tag) => tag.text === trimmed) == null &&
      selected.find((t) => t.text === trimmed) == null
    )
  }, [availableTags, query, selected])

  const matchedTags = useMemo(() => {
    const trimmed = query.trim().toLocaleLowerCase()
    if (trimmed === '') return sortByAttributeAsc('text', availableTags)
    return sortByAttributeAsc(
      'text',
      availableTags.filter((tag) =>
        tag.text.toLocaleLowerCase().startsWith(trimmed)
      )
    )
  }, [availableTags, query])

  const toggleTagSelection = useCallback(
    (tag: string, isNew?: boolean) => {
      if (selected.find((t) => t.text === tag) != null) {
        return setSelected((prev) => {
          const newSelection = prev.slice().filter((t) => t.text !== tag)
          return newSelection
        })
      } else {
        return setSelected((prev) => {
          return [...prev.slice(), { isNew, text: tag }]
        })
      }
    },
    [selected]
  )

  const availableOptions: SearchableListOption[] = useMemo(() => {
    const options: SearchableListOption[] = []

    if (searchedTagIsNew) {
      options.push({
        label: `Create "${query.trim()}"`,
        onClick: () => toggleTagSelection(query.trim(), true),
      })
    }

    selected
      .filter((selection) => selection.isNew)
      .forEach((tag) => {
        options.push({
          label: tag.text,
          checked: selected.find((t) => t.text === tag.text) != null,
          onClick: () => toggleTagSelection(tag.text),
        })
      })

    matchedTags.forEach((tag) => {
      options.push({
        label: tag.text,
        checked: selected.find((t) => t.text === tag.text) != null,
        onClick: () => toggleTagSelection(tag.text),
      })
    })

    return options
  }, [matchedTags, query, selected, searchedTagIsNew, toggleTagSelection])

  return (
    <Container className='labels__selection'>
      <SearchableOptionListPopup
        options={availableOptions}
        query={query}
        setQuery={setQuery}
        onSubmit={() => {
          return sendTags(selected.map((tag) => tag.text))
        }}
      />
    </Container>
  )
}

const Container = styled.div`
  #labels__selection__input {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .labels__selection__break {
    display: block;
    height: 1px;
    width: 100%;
    background: ${({ theme }) => theme.colors.border.second};
    flex: 0 0 auto;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
  .labels__selection__submit {
    display: flex;
    width: 100%;
  }

  .labels__selection__wrapper {
    min-height: 30px;
    max-height: 250px;
  }

  .selection__checkbox {
    flex: 0 0 auto;
  }

  .selection__item__wrapper {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    width: 100%;
    height: 30px;
    cursor: pointer;
    background: none;
    transition: background 200ms;
    color: ${({ theme }) => theme.colors.text.primary};
    justify-content: space-between;
    text-align: left;
    border-radius: ${({ theme }) => theme.borders.radius}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;

    &:focus {
      background: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
    }

    .selection__label {
      flex: 1 1 auto;
      ${overflowEllipsis}
    }

    .selection__item__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
      width: 22px;
      height: 22px;
      line-height: 19px;
    }

    .selection__checkbox {
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
      pointer-events: none;
    }

    .selection__item__icon,
    .selection__checkbox {
      flex: 0 0 auto;
      flex-shrink: 0;
    }
  }
`

export default React.memo(DocLabelSelectionModal)

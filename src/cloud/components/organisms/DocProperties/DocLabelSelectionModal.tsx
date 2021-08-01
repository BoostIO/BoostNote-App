import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../../shared/components/atoms/Button'
import UpDownList from '../../../../shared/components/atoms/UpDownList'
import VerticalScroller from '../../../../shared/components/atoms/VerticalScroller'
import Form from '../../../../shared/components/molecules/Form'
import Checkbox from '../../../../shared/components/molecules/Form/atoms/FormCheckbox'
import FormInput from '../../../../shared/components/molecules/Form/atoms/FormInput'
import FormRowItem from '../../../../shared/components/molecules/Form/templates/FormRowItem'
import styled from '../../../../shared/lib/styled'
import { overflowEllipsis } from '../../../../shared/lib/styled/styleFunctions'
import { getMapValues } from '../../../../shared/lib/utils/array'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { useNav } from '../../../lib/stores/nav'

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

  const { translate } = useI18n()

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
    if (trimmed === '') return availableTags
    return availableTags.filter((tag) =>
      tag.text.toLocaleLowerCase().startsWith(trimmed)
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

  const inputRef = useRef<HTMLInputElement>(null)
  useEffectOnce(() => {
    inputRef.current!.focus()
  })

  return (
    <Container className='labels__selection'>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          return sendTags(selected.map((tag) => tag.text))
        }}
      >
        <UpDownList ignoreFocus={true}>
          <FormRowItem>
            <FormInput
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate(lngKeys.GeneralSearchVerb)}
              id='labels__selection__input'
            />
          </FormRowItem>
          <VerticalScroller className='labels__selection__wrapper'>
            {searchedTagIsNew && (
              <div className='selection__item'>
                <button
                  className='selection__item__wrapper'
                  onClick={() => toggleTagSelection(query.trim(), true)}
                  id={`selection__item__new`}
                  tabIndex={0}
                  type='button'
                >
                  <span className='selection__label'>
                    {`Create "${query.trim()}"`}
                  </span>
                </button>
              </div>
            )}
            {selected
              .filter((selection) => selection.isNew)
              .map((tag) => (
                <div className='selection__item' key={tag.text}>
                  <button
                    className='selection__item__wrapper'
                    onClick={() => toggleTagSelection(tag.text)}
                    id={`selection__item__${tag.text}`}
                    tabIndex={0}
                    type='button'
                  >
                    <span className='selection__label'>{tag.text} (new)</span>
                    <Checkbox checked={true} className='selection__checkbox' />
                  </button>
                </div>
              ))}
            {matchedTags.map((tag) => (
              <div className='selection__item' key={tag.id}>
                <button
                  className='selection__item__wrapper'
                  onClick={() => toggleTagSelection(tag.text)}
                  id={`selection__item__${tag.id}`}
                  tabIndex={0}
                  type='button'
                >
                  <span className='selection__label'>{tag.text}</span>
                  <Checkbox
                    checked={selected.find((t) => t.text === tag.text) != null}
                    className='selection__checkbox'
                  />
                </button>
              </div>
            ))}
          </VerticalScroller>
          <div className='labels__selection__break' />
          <Button
            type='submit'
            variant='transparent'
            className='labels__selection__submit'
            id='labels__selection__submit'
            size='sm'
          >
            {translate(lngKeys.GeneralSaveVerb)}
          </Button>
        </UpDownList>
      </Form>
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

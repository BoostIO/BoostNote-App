import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { mdiPlus } from '@mdi/js'
import { useNav } from '../../../../../../cloud/lib/stores/nav'
import { createTag } from '../../../../../../cloud/api/teams/tags'
import { SerializedTeam } from '../../../../../../cloud/interfaces/db/team'
import { SerializedDocWithSupplemental } from '../../../../../../cloud/interfaces/db/doc'
import { isChildNode } from '../../../../../../cloud/lib/dom'
import { useToast } from '../../../../../../design/lib/stores/toast'
import { contextMenuFormItem } from '../../../../../../design/lib/styled/styleFunctions'
import styled from '../../../../../../design/lib/styled'
import FormInput from '../../../../../../design/components/molecules/Form/atoms/FormInput'
import cc from 'classcat'
import { lngKeys } from '../../../../../../cloud/lib/i18n/types'
import { useI18n } from '../../../../../../cloud/lib/hooks/useI18n'
import Spinner from '../../../../../../design/components/atoms/Spinner'
import Icon from '../../../../../../design/components/atoms/Icon'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TagsAutoCompleteInputProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const TagsAutoCompleteInput = ({ team, doc }: TagsAutoCompleteInputProps) => {
  const [showInput, setShowInput] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tagsMap, updateDocsMap, updateTagsMap } = useNav()
  const [sending, setSending] = useState<boolean>(false)
  const { pushApiErrorMessage } = useToast()
  const [tagText, setTagText] = useState<string>('')
  const { translate } = useI18n()

  useEffect(() => {
    if (showInput && inputRef.current != null) {
      inputRef.current.focus()
    }
  }, [showInput])

  const createTagHandler = useCallback(
    async (tagText: string) => {
      if (sending || tagText.trim() === '') {
        return
      }

      setSending(true)
      try {
        const { doc: newDoc, tag } = await createTag(team, {
          docId: doc.id,
          text: tagText,
        })
        updateTagsMap([tag.id, tag])
        updateDocsMap([newDoc.id, newDoc])
        setShowInput(false)
        setTagText('')
      } catch (error) {
        pushApiErrorMessage(error)
      }

      setSending(false)
    },
    [pushApiErrorMessage, sending, doc.id, team, updateDocsMap, updateTagsMap]
  )

  const activateAndFocus = useCallback(() => {
    setShowInput(true)
  }, [])

  const onBlurHandler = (event: any) => {
    if (
      containerRef.current !== event.relatedTarget &&
      !isChildNode(
        containerRef.current,
        event.relatedTarget as HTMLElement | null
      )
    ) {
      setShowInput(false)
    }
  }

  const tagsIdsAlreadyInDoc = useMemo(() => {
    if (doc.tags == null || doc.tags.length === 0) {
      return []
    }

    return doc.tags.map((tag) => tag.id)
  }, [doc])

  const autoCompleteOptions: {
    label: string
    value: string
  }[] = useMemo(() => {
    const options: { label: string; value: string }[] = []
    if (tagsMap.size === 0) {
      if (tagText.trim() !== '') {
        options.push({
          label: `${translate(lngKeys.GeneralCreate)}: "${tagText}"`,
          value: tagText,
        })
      }
      return options
    }

    const allTags = [...tagsMap.values()]
    const missingTags = allTags
      .filter((tag) => !tagsIdsAlreadyInDoc.includes(tag.id))
      .filter((tag) => tag.text.toLowerCase().startsWith(tagText.toLowerCase()))

    const missingTagsTextArray = missingTags.map((tag) => tag.text)

    if (tagText.trim() !== '') {
      const exactMatchIsFound = allTags.map((tag) => tag.text).includes(tagText)
      if (!exactMatchIsFound) {
        options.push({ label: `Create "${tagText}"`, value: tagText })
      }
    }

    options.push(
      ...missingTagsTextArray
        .map((tag) => {
          return { label: tag, value: tag }
        })
        .sort((a, b) => {
          if (a.value < b.value) {
            return -1
          } else {
            return 1
          }
        })
    )

    return options
  }, [tagsMap, tagsIdsAlreadyInDoc, tagText, translate])

  const selectOptionHandler = useCallback(
    async (event: any, option: string) => {
      event.preventDefault()
      setTagText(option)
      createTagHandler(option)
    },
    [createTagHandler]
  )

  const inputOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setTagText(event.target.value)
    },
    [setTagText]
  )

  return (
    <Container className={cc([(doc.tags || []).length === 0 && 'empty'])}>
      {!showInput ? (
        (doc.tags || []).length === 0 ? (
          <button
            className='tag__add--empty'
            id='tag__add__btn'
            onClick={activateAndFocus}
          >
            {translate(lngKeys.AddALabel)}
          </button>
        ) : (
          <button
            className='tag__add'
            id='tag__add__btn'
            onClick={activateAndFocus}
          >
            <Icon path={mdiPlus} size={16} />
          </button>
        )
      ) : (
        <div
          className='tag__add__input__container'
          onBlur={onBlurHandler}
          ref={containerRef}
          tabIndex={-1}
        >
          {sending && (
            <Spinner
              size={12}
              className='relative tag-spinner'
              style={{ marginTop: '-6px' }}
            />
          )}
          <FormInput
            id='autocomplete-tags'
            ref={inputRef}
            className='autocomplete__input'
            placeholder='Add New Label...'
            value={tagText}
            onChange={inputOnChangeEvent}
            disabled={sending}
            autoComplete='off'
          />
          {autoCompleteOptions.length > 0 && (
            <div className='autocomplete__container' ref={autocompleteRef}>
              {autoCompleteOptions.map((option, i) => (
                <a
                  className='autocomplete__option'
                  key={`option-autocomplete=${i}`}
                  id={`option--autocomplete=${i}`}
                  href='#'
                  onClick={(e: any) => selectOptionHandler(e, option.value)}
                >
                  {option.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  margin-top: 6px;

  &.empty {
    width: 100%;
    margin: 0 !important;
  }

  .tag__add--empty {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    background: transparent;
    outline: 0;
    width: 100%;
    display: block;
    color: ${({ theme }) => theme.colors.text.subtle};
    height: 32px;
    border-radius: 4px;
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
    ${({ theme }) => contextMenuFormItem({ theme }, ':focus')};
    text-align: left;
  }

  .tag__add {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.subtle};
    margin: 0 4px;
    padding: 0;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.primary} !important;
    }
  }

  .tag__add__input__container {
    position: relative;
    width: 100%;
  }

  .autocomplete__input {
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
    margin-top: 4px;
  }

  .autocomplete__container {
    z-index: 9000;
    position: absolute;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    width: 100%;
    height: auto;
    max-width: auto;
    max-height: 150px;
    overflow-y: auto;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    border: none;
    left: 0;
    top: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .autocomplete__option {
    width: 100%;
    flex-shrink: 0;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.text.subtle};
    text-decoration: none;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.colors.background.quaternary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

export default TagsAutoCompleteInput

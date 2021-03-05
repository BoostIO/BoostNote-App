import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { mdiPlus } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import { useNav } from '../../../lib/stores/nav'
import { useToast } from '../../../lib/stores/toast'
import { createTag } from '../../../api/teams/tags'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { Spinner } from '../../atoms/Spinner'
import styled from '../../../lib/styled'
import { inputStyle } from '../../../lib/styled/styleFunctions'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { isChildNode } from '../../../lib/dom'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TagsAutoCompleteInputProps {
  doc: SerializedDocWithBookmark
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
        options.push({ label: `Create "${tagText}"`, value: tagText })
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
  }, [tagsMap, tagsIdsAlreadyInDoc, tagText])

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

  useUpDownNavigationListener(autocompleteRef, {
    overrideInput: true,
  })

  return (
    <Container>
      {!showInput ? (
        <button
          className='tag__add'
          id='tag__add__btn'
          onClick={activateAndFocus}
        >
          <IconMdi path={mdiPlus} size={16} />
        </button>
      ) : (
        <div
          className='tag__add__input__container'
          onBlur={onBlurHandler}
          ref={containerRef}
        >
          {sending && (
            <Spinner
              size={12}
              className='relative tag-spinner'
              style={{ marginTop: '-6px' }}
            />
          )}
          <input
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

  .tag__add {
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid ${({ theme }) => theme.subtleBorderColor};
    color: ${({ theme }) => theme.subtleTextColor};
    margin: 0 4px;
    padding: 0;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.emphasizedTextColor} !important;
    }
  }

  .tag__add__input__container {
    position: relative;
    width: 100%;
  }

  .autocomplete__input {
    ${inputStyle};
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
    margin-top: 4px;
    padding: ${({ theme }) => theme.space.xxsmall}px
      ${({ theme }) => theme.space.xsmall}px;
  }

  .autocomplete__container {
    z-index: 9000;
    position: absolute;
    padding: ${({ theme }) => theme.space.xsmall}px 0;
    width: 100%;
    height: auto;
    max-width: auto;
    max-height: 70vh;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    border: none;
    left: 0;
    top: 100%;
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    box-shadow: ${({ theme }) => theme.baseShadowColor};
  }

  .autocomplete__option {
    width: 100%;
    padding: 0 ${({ theme }) => theme.space.xsmall}px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.subtleTextColor};
    text-decoration: none;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.transparentPrimaryBackgroundColor};
      color: ${({ theme }) => theme.primaryTextColor};
    }
  }
`

export default TagsAutoCompleteInput

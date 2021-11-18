import React, { useState, useCallback, useMemo, useRef } from 'react'
import { mdiLabelOutline, mdiPlus } from '@mdi/js'
import { useNav } from '../../../lib/stores/nav'
import { createTag } from '../../../api/teams/tags'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { useToast } from '../../../../design/lib/stores/toast'
import styled from '../../../../design/lib/styled'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import cc from 'classcat'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import Spinner from '../../../../design/components/atoms/Spinner'
import DocPropertyValueButton from '../../Props/Pickers/PropertyValueButton'
import Icon from '../../../../design/components/atoms/Icon'
import { useModal } from '../../../../design/lib/stores/modal'
import { useEffectOnce } from 'react-use'
import Flexbox from '../../../../design/components/atoms/Flexbox'

interface TagsAutoCompleteInputProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const TagsAutoCompleteInput = ({ team, doc }: TagsAutoCompleteInputProps) => {
  const { translate } = useI18n()
  const { openContextModal } = useModal()
  const activateAndFocus = useCallback(
    (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
      openContextModal(ev, <TagsSelectorModal team={team} doc={doc} />, {
        removePadding: true,
        width: 200,
        keepAll: true,
      })
    },
    [team, doc, openContextModal]
  )

  return (
    <Container
      className={cc([
        'doc__tags__create',
        (doc.tags || []).length === 0 && 'doc__tags__create--empty',
      ])}
    >
      {(doc.tags || []).length === 0 ? (
        <DocPropertyValueButton
          iconPath={mdiLabelOutline}
          id='tag__add__btn'
          empty={true}
          onClick={activateAndFocus}
          isReadOnly={false}
        >
          {translate(lngKeys.AddALabel)}
        </DocPropertyValueButton>
      ) : (
        <button
          className='tag__add'
          id='tag__add__btn'
          onClick={activateAndFocus}
        >
          <Icon path={mdiPlus} size={16} />
        </button>
      )}
    </Container>
  )
}

interface TagsSelectorModalProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
}

const TagsSelectorModal = ({ team, doc }: TagsSelectorModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const { tagsMap, updateDocsMap, updateTagsMap } = useNav()
  const { pushApiErrorMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const [tagText, setTagText] = useState<string>('')
  const { translate } = useI18n()
  const { closeLastModal } = useModal()

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

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
        setTagText('')
        closeLastModal()
      } catch (error) {
        pushApiErrorMessage(error)
      }

      setSending(false)
    },
    [
      pushApiErrorMessage,
      sending,
      doc.id,
      team,
      updateDocsMap,
      updateTagsMap,
      closeLastModal,
    ]
  )

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

  useUpDownNavigationListener(containerRef, {
    overrideInput: true,
  })

  return (
    <ModalContainer ref={containerRef} className='autocomplete__container'>
      <Flexbox>
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
        {sending && <Spinner className='tag__add__input__spinner' />}
      </Flexbox>
      {!sending && autoCompleteOptions.length > 0 && (
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
    </ModalContainer>
  )
}

const ModalContainer = styled.div`
  .autocomplete__input {
    flex: 1 1 auto;
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
  }

  .autocomplete__container {
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    width: 100%;
    height: auto;
    max-width: auto;
    max-height: 150px;
    overflow-y: auto;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    display: inline-flex;
    flex-direction: column;
    border: none;
    left: 0;
    top: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .autocomplete__option {
    width: 100%;
    display: block;
    flex-shrink: 0;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;
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

  .tag__add__input__spinner {
    flex: 0 0 auto;
    border-color: ${({ theme }) => theme.colors.variants.primary.text};
    border-right-color: transparent;
    display: inline-flex;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

const Container = styled.div`
  &.doc__tags__create--empty {
    width: 100%;
    margin-bottom: 0 !important;
  }

  .tag__add {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    display: inline-flex;
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
`

export default TagsAutoCompleteInput

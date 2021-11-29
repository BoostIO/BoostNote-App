import React, { useState, useCallback, useMemo, useRef } from 'react'
import { mdiLabelOutline, mdiPlus } from '@mdi/js'
import { useNav } from '../../../lib/stores/nav'
import { createTag } from '../../../api/teams/tags'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { useToast } from '../../../../design/lib/stores/toast'
import styled from '../../../../design/lib/styled'
import cc from 'classcat'
import { lngKeys } from '../../../lib/i18n/types'
import { useI18n } from '../../../lib/hooks/useI18n'
import DocPropertyValueButton from '../../Props/Pickers/PropertyValueButton'
import Icon from '../../../../design/components/atoms/Icon'
import { useModal } from '../../../../design/lib/stores/modal'
import { useEffectOnce } from 'react-use'
import LabelManager, { LabelLike } from '../../molecules/LabelManager'
import { filterIter } from '../../../lib/utils/iterator'
import { SerializedTag } from '../../../interfaces/db/tag'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'

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

type LabelLikeTag = LabelLike & SerializedTag

const TagsSelectorModal = ({ team, doc }: TagsSelectorModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tagsMap, updateDocsMap, updateTagsMap } = useNav()
  const { pushApiErrorMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const { closeLastModal } = useModal()
  const { deleteTagApi, updateTagApi } = useCloudApi()

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const tagsIdsAlreadyInDoc = useMemo(() => {
    if (doc.tags == null || doc.tags.length === 0) {
      return new Set()
    }

    return new Set(doc.tags.map((tag) => tag.id))
  }, [doc])

  const autoCompleteOptions: LabelLikeTag[] = useMemo(() => {
    const allTags = filterIter(
      (tag) => !tagsIdsAlreadyInDoc.has(tag.id),
      tagsMap.values()
    ).map((label) => ({ ...label, name: label.text }))

    allTags.sort((a, b) => {
      if (a.text < b.text) {
        return -1
      } else {
        return 1
      }
    })

    return allTags
  }, [tagsMap, tagsIdsAlreadyInDoc])

  const createTagHandler = useCallback(
    async (newTag: LabelLike | null) => {
      if (sending || newTag == null || newTag.name === '') {
        return
      }

      setSending(true)
      try {
        const { doc: newDoc, tag } = await createTag(team, {
          docId: doc.id,
          text: newTag.name,
          backgroundColor: newTag.backgroundColor,
        })
        updateTagsMap([tag.id, tag])
        updateDocsMap([newDoc.id, newDoc])
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

  const updateTagHandler = useCallback(
    async (tag: LabelLikeTag) => {
      if (sending) {
        return
      }
      try {
        setSending(true)
        await updateTagApi(tag, {
          text: tag.name,
          backgroundColor: tag.backgroundColor,
        })
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setSending(false)
      }
    },
    [updateTagApi, pushApiErrorMessage, sending]
  )

  useUpDownNavigationListener(containerRef, {
    overrideInput: true,
  })

  return (
    <LabelManager
      labels={autoCompleteOptions}
      onSelect={createTagHandler}
      onCreate={createTagHandler}
      onUpdate={updateTagHandler}
      onDelete={deleteTagApi}
    />
  )
}

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

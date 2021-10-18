import React, { useState, useCallback, useMemo } from 'react'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import TagsAutoCompleteInput from './TagsAutoCompleteInput'
import { deleteTagFromDoc } from '../../../api/teams/docs/tags'
import { useNav } from '../../../lib/stores/nav'
import DocTagsListItem from '../../DocTagsListItem'
import { SerializedTag } from '../../../interfaces/db/tag'
import { mdiChevronRight, mdiChevronDown, mdiLabelOutline } from '@mdi/js'
import { useToast } from '../../../../design/lib/stores/toast'
import cc from 'classcat'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'

interface DocTagsListProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
  readOnly: boolean
}

const maxTagsDisplayed = 4

const DocTagsList = ({ doc, team, readOnly }: DocTagsListProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const { pushApiErrorMessage } = useToast()
  const { updateDocsMap } = useNav()
  const [removing, setRemoving] = useState<string>()
  const [expanded, setExpanded] = useState<boolean>(false)

  const onDeleteHandler = useCallback(
    async (tagId: string) => {
      if (sending) {
        return
      }

      setSending(true)
      setRemoving(tagId)
      try {
        const { doc: newDoc } = await deleteTagFromDoc(team.id, doc.id, tagId)
        updateDocsMap([newDoc.id, newDoc])
      } catch (error) {
        pushApiErrorMessage(error)
      }
      setRemoving(undefined)
      setSending(false)
    },
    [doc.id, team.id, sending, setSending, pushApiErrorMessage, updateDocsMap]
  )

  const listContent = useMemo(() => {
    if (doc.tags == null || doc.tags.length === 0) {
      return null
    }

    let tags: SerializedTag[] = doc.tags

    if (!expanded) {
      tags = doc.tags.slice(0, maxTagsDisplayed)
    }

    return (
      <>
        {tags.map((tag) => (
          <DocTagsListItem
            tag={tag}
            team={team}
            onDeleteHandler={!readOnly ? onDeleteHandler : undefined}
            removing={removing}
            sending={sending}
            key={tag.id}
          />
        ))}
      </>
    )
  }, [doc.tags, expanded, onDeleteHandler, removing, sending, team, readOnly])

  const tags = doc.tags || []

  return (
    <ListContainer className='doc__tags'>
      <div
        className={cc([
          'doc__tags__wrapper',
          (doc.tags || []).length === 0
            ? 'doc__tags__wrapper--empty'
            : 'doc__tags__wrapper--full',
        ])}
      >
        {(doc.tags || []).length !== 0 && (
          <Icon path={mdiLabelOutline} size={16} className='doc__tags__icon' />
        )}
        {listContent}{' '}
        {tags.length > maxTagsDisplayed && (
          <button
            className='doc__tags__expand'
            tabIndex={-1}
            onClick={() => setExpanded((val) => !val)}
          >
            {!expanded ? (
              <div className='doc__tags__expand__wrapper'>
                +{tags.length - maxTagsDisplayed}
                <Icon path={mdiChevronRight} size={16} />
              </div>
            ) : (
              <div className='doc__tags__expand__wrapper'>
                <Icon path={mdiChevronDown} size={16} />
              </div>
            )}
          </button>
        )}
        {!readOnly && <TagsAutoCompleteInput team={team} doc={doc} />}
      </div>
    </ListContainer>
  )
}

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 2 2 auto;
  align-items: center;
  position: relative;
  height: 100%;
  min-width: 0;

  .doc__tags__icon {
    color: ${({ theme }) => theme.colors.text.subtle};
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__tags__wrapper {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    height: 100%;
    box-sizing: content-box;
    &.doc__tags__wrapper--full {
      padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
    > * {
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px !important;
    }
  }

  .doc__tags__expand {
    height: 24px;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    background: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;

    .doc__tags__expand__wrapper {
      display: inline-flex;
      align-items: center;
      white-space: none;
    }

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

export default DocTagsList

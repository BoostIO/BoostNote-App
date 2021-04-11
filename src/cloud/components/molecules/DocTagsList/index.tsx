import React, { useState, useCallback, useMemo } from 'react'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import {
  StyledDocTagsList,
  StyledToolbarExpandTag,
  StyledDocTagsListContainer,
} from './styled'
import TagsAutoCompleteInput from './TagsAutoCompleteInput'
import { deleteTagFromDoc } from '../../../api/teams/docs/tags'
import { useNav } from '../../../lib/stores/nav'
import DocTagsListItem from './DocTagsListItem'
import { SerializedTag } from '../../../interfaces/db/tag'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'
import { useToast } from '../../../../lib/v2/stores/toast'

interface DocTagsListProps {
  doc: SerializedDocWithBookmark
  team: SerializedTeam
}

const maxTagsDisplayed = 4

const DocTagsList = ({ doc, team }: DocTagsListProps) => {
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
            onDeleteHandler={onDeleteHandler}
            removing={removing}
            sending={sending}
            key={tag.id}
          />
        ))}
      </>
    )
  }, [doc.tags, expanded, onDeleteHandler, removing, sending, team])

  const tags = doc.tags || []

  return (
    <StyledDocTagsListContainer>
      <StyledDocTagsList>
        {listContent}{' '}
        {tags.length > maxTagsDisplayed && (
          <StyledToolbarExpandTag
            tabIndex={-1}
            onClick={() => setExpanded((val) => !val)}
          >
            {!expanded ? (
              <span style={{ whiteSpace: 'nowrap' }}>
                +{tags.length - maxTagsDisplayed}
                <IconMdi path={mdiChevronRight} size={14} />
              </span>
            ) : (
              <IconMdi path={mdiChevronDown} size={14} />
            )}
          </StyledToolbarExpandTag>
        )}
        <TagsAutoCompleteInput team={team} doc={doc} />
      </StyledDocTagsList>
    </StyledDocTagsListContainer>
  )
}

export default DocTagsList

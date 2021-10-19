import React, { useState, useCallback, useMemo } from 'react'
import { SerializedDocWithSupplemental } from '../../../../../../cloud/interfaces/db/doc'
import { SerializedTeam } from '../../../../../../cloud/interfaces/db/team'
import {
  StyledDocTagsList,
  StyledToolbarExpandTag,
  StyledDocTagsListContainer,
} from './styled'
import TagsAutoCompleteInput from './TagsAutoCompleteInput'
import { deleteTagFromDoc } from '../../../../../../cloud/api/teams/docs/tags'
import { useNav } from '../../../../../../cloud/lib/stores/nav'
import DocTagsListItem from './DocTagsListItem'
import { SerializedTag } from '../../../../../../cloud/interfaces/db/tag'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'
import { useToast } from '../../../../../../design/lib/stores/toast'
import cc from 'classcat'
import Icon from '../../../../../../design/components/atoms/Icon'

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
            onDeleteHandler={onDeleteHandler}
            removing={removing}
            sending={sending}
            key={tag.id}
            removable={!readOnly}
          />
        ))}
      </>
    )
  }, [doc.tags, expanded, onDeleteHandler, removing, sending, team, readOnly])

  const tags = doc.tags || []

  return (
    <StyledDocTagsListContainer>
      <StyledDocTagsList
        className={cc([(doc.tags || []).length === 0 && 'list--empty'])}
      >
        {listContent}{' '}
        {tags.length > maxTagsDisplayed && (
          <StyledToolbarExpandTag
            tabIndex={-1}
            onClick={() => setExpanded((val) => !val)}
          >
            {!expanded ? (
              <span style={{ whiteSpace: 'nowrap' }}>
                +{tags.length - maxTagsDisplayed}
                <Icon path={mdiChevronRight} size={12} />
              </span>
            ) : (
              <Icon path={mdiChevronDown} size={12} />
            )}
          </StyledToolbarExpandTag>
        )}
        {!readOnly && <TagsAutoCompleteInput team={team} doc={doc} />}
      </StyledDocTagsList>
    </StyledDocTagsListContainer>
  )
}

export default DocTagsList

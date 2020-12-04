import React from 'react'
import Icon from './Icon'
import styled from '../../lib/styled'
import { mdiClose } from '@mdi/js'
import { flexCenter } from '../../lib/styled/styleFunctions'
import { useRouter } from '../../lib/router'
import { useTranslation } from 'react-i18next'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'

const TagItem = styled.li`
  margin-right: 5px;
  height: 18px;
  font-size: 14px;
  ${flexCenter}
  background-color: ${({ theme }) => theme.secondaryBackgroundColor};
  border-radius: 9px;
  white-space: nowrap;
`

const TagItemAnchor = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding-left: 0.75em;
  text-decoration: none;
  color: ${({ theme }) => theme.textColor};
`

const TagRemoveButton = styled.button`
  background-color: transparent;
  cursor: pointer;
  padding: 0 0.25em;
  border: none;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.textColor};
  width: 24px;
  height: 24px;
  ${flexCenter}
`

interface TagNavigatorListItemProps {
  storageId: string
  tag: string
  noteId?: string
  currentTagName: string | null
  removeTagByName: (tagName: string) => void
}

const TagNavigatorListItem = ({
  storageId,
  tag,
  noteId,
  currentTagName,
  removeTagByName,
}: TagNavigatorListItemProps) => {
  const { t } = useTranslation()
  const { push } = useRouter()
  const { report } = useAnalytics()

  return (
    <TagItem>
      <TagItemAnchor
        title={`#${tag}`}
        onClick={() => {
          if (noteId == null) {
            push(`/app/storages/${storageId}/tags/${tag}`)
            return
          }
          push(`/app/storages/${storageId}/tags/${tag}/${noteId}`)
        }}
        className={currentTagName === tag ? 'active' : ''}
      >
        {tag}
      </TagItemAnchor>
      <TagRemoveButton
        title={t('tag.removeX', { tag })}
        onClick={() => {
          removeTagByName(tag)
          report(analyticsEvents.removeNoteTag)
        }}
      >
        <Icon path={mdiClose} />
      </TagRemoveButton>
    </TagItem>
  )
}

export default TagNavigatorListItem

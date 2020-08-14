import React from 'react'
import Icon from './Icon'
import styled from '../../lib/styled'
import { mdiClose } from '@mdi/js'
import { flexCenter } from '../../lib/styled/styleFunctions'
import { useRouter } from '../../lib/router'

const TagItem = styled.li`
  margin-right: 5px;
  height: 24px;
  ${flexCenter}
  background-color: #404040;
  border-radius: 12px;
`

const TagItemAnchor = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding-left: 0.75em;
  text-decoration: none;
  color: ${({ theme }) => theme.textColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

const TagRemoveButton = styled.button`
  background-color: transparent;
  cursor: pointer;
  padding: 0 0.25em;
  border: none;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
  width: 24px;
  height: 24px;
  ${flexCenter}
`

interface TagNavigatorListItemProps {
  storageId: string
  tag: string
  noteId: string
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
  const { push } = useRouter()
  return (
    <TagItem>
      <TagItemAnchor
        onClick={() => {
          push(`/app/storages/${storageId}/tags/${tag}/${noteId}`)
        }}
        className={currentTagName === tag ? 'active' : ''}
      >
        {tag}
      </TagItemAnchor>
      <TagRemoveButton
        onClick={() => {
          removeTagByName(tag)
        }}
      >
        <Icon path={mdiClose} />
      </TagRemoveButton>
    </TagItem>
  )
}

export default TagNavigatorListItem

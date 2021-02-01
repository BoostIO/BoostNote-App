import React from 'react'
import styled from '../../../lib/styled'
import { getHexFromUUID } from '../../../lib/utils/string'
import { OrderedChild } from '../../organisms/Sidebar/SidebarBookmarks'
import { SerializedTeam } from '../../../interfaces/db/team'
import SideNavigatorItem from '../../organisms/Sidebar/SideNavigator/SideNavigatorItem'
import { getFolderHref } from '../../atoms/Link/FolderLink'
import { getDocLinkHref } from '../../atoms/Link/DocLink'
import { mdiFolderOutline, mdiCardTextOutline } from '@mdi/js'
import { getDocTitle } from '../../../lib/utils/patterns'
import EmojiIcon from '../../atoms/EmojiIcon'

interface BookmarkListProps {
  orderedChildren: OrderedChild[]
  team: SerializedTeam
}

const BookmarkList = ({ orderedChildren, team }: BookmarkListProps) => {
  return (
    <StyledBookmarkList>
      {orderedChildren.length > 0 &&
        orderedChildren.map((child) => {
          if (child.type === 'folder') {
            const childId = `bookmarkList-fD${getHexFromUUID(
              child.resource.id
            )}`
            return (
              <li key={child.resource.id}>
                <SideNavigatorItem
                  href={getFolderHref(child.resource, team, 'index')}
                  label={child.resource.name}
                  iconNode={
                    <EmojiIcon
                      defaultIcon={mdiFolderOutline}
                      emoji={child.resource.emoji}
                      size={16}
                    />
                  }
                  depth={1}
                  id={childId}
                />
              </li>
            )
          }

          const childId = `bookmarkList-dC${getHexFromUUID(child.resource.id)}`
          return (
            <li key={child.resource.id}>
              <SideNavigatorItem
                href={getDocLinkHref(child.resource, team, 'index')}
                label={getDocTitle(child.resource, 'Untitled')}
                iconNode={
                  <EmojiIcon
                    defaultIcon={mdiCardTextOutline}
                    emoji={child.resource.emoji}
                    size={16}
                  />
                }
                depth={1}
                id={childId}
              />
            </li>
          )
        })}
    </StyledBookmarkList>
  )
}

const StyledBookmarkList = styled.ul`
  list-style: none;
  margin: 0;
  padding-left: 0;

  .emoji-icon.marginLeft {
    margin-left: 0;
  }

  .controls {
    svg {
      margin-left: 0 !important;
      display: inline-block;
    }
  }
`

export default BookmarkList

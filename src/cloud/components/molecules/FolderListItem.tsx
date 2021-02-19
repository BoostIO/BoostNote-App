import React, { useMemo, useState } from 'react'
import styled from '../../lib/styled'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
} from '../organisms/Sidebar/SideNavigator/styled'
import { mdiTrashCan, mdiStar, mdiStarOutline, mdiFolderOutline } from '@mdi/js'
import IconMdi from '../atoms/IconMdi'
import { SerializedTeam } from '../../interfaces/db/team'
import { baseIconStyle } from '../../lib/styled/styleFunctions'
import cc from 'classcat'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import FolderLink from '../atoms/Link/FolderLink'
import { getFormattedBoosthubDate } from '../../lib/date'
import {
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
} from '../../lib/keyboard'
import { shortcuts } from '../../lib/shortcuts'
import SideNavIcon from '../organisms/Sidebar/SideNavigator/SideNavIcon'

interface FolderItemProps {
  item: SerializedFolderWithBookmark
  team: SerializedTeam
  showUpdatedDate?: boolean
  onBookmarkHandler?: () => void
  onDeleteHandler?: () => void
  id: string
}

const FolderListItem = ({
  item,
  team,
  showUpdatedDate = false,
  onDeleteHandler,
  onBookmarkHandler,
  id,
}: FolderItemProps) => {
  const [focused, setFocused] = useState(false)

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const updatedLabel = useMemo(() => {
    if (!showUpdatedDate) {
      return null
    }
    return (
      <div className='date-label'>
        Updated {getFormattedBoosthubDate(item.updatedAt, true)}
      </div>
    )
  }, [showUpdatedDate, item.updatedAt])

  const keyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (!focused || onBookmarkHandler == null) {
        return
      }

      if (isSingleKeyEventOutsideOfInput(event, shortcuts.bookmarkDoc)) {
        onBookmarkHandler()
        preventKeyboardEventPropagation(event)
      }
    }
  }, [onBookmarkHandler, focused])
  useCapturingGlobalKeyDownHandler(keyDownHandler)

  return (
    <SideNavItemStyle
      className={cc(['sideNavItemStyle', focused && 'focused'])}
      onBlur={onBlurHandler}
    >
      <div className={cc(['sideNavWrapper'])}>
        <SideNavClickableButtonStyle>
          <SideNavIcon
            mdiPath={mdiFolderOutline}
            item={item}
            type='folder'
            className='marginLeft'
          />
          <FolderLink
            className='itemLink'
            folder={item}
            team={team}
            id={id}
            onFocus={() => setFocused(true)}
          >
            <SideNavLabelStyle>{item.name}</SideNavLabelStyle>
          </FolderLink>
        </SideNavClickableButtonStyle>
        <SideNavControlStyle className='controls always'>
          {updatedLabel}
          <Wrapper>
            {onBookmarkHandler != null && (
              <Icon tabIndex={-1} onClick={onBookmarkHandler}>
                {item.bookmarked ? (
                  <IconMdi path={mdiStar} />
                ) : (
                  <IconMdi path={mdiStarOutline} />
                )}
              </Icon>
            )}
            {onDeleteHandler != null && (
              <Icon tabIndex={-1} onClick={onDeleteHandler}>
                <IconMdi path={mdiTrashCan} />
              </Icon>
            )}
          </Wrapper>
        </SideNavControlStyle>
      </div>
    </SideNavItemStyle>
  )
}

export default FolderListItem

const Icon = styled.button`
  background: none;
  ${baseIconStyle}
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  padding: 0;
  cursor: pointer;
  svg {
    display: inline-block;
    vertical-align: sub;
  }
`

const Wrapper = styled.div`
  vertical-align: middle;
  display: flex;
  text-align: right;
`

import React, { useMemo, useState } from 'react'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import DocLink from '../atoms/Link/DocLink'
import { SerializedTeam } from '../../interfaces/db/team'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
  StyledNavTagsList,
} from '../organisms/Sidebar/SideNavigator/styled'
import cc from 'classcat'
import { mdiTrashCan, mdiStar, mdiStarOutline } from '@mdi/js'
import IconMdi from '../atoms/IconMdi'
import { mdiCardTextOutline } from '@mdi/js'
import { baseIconStyle } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { getDocTitle } from '../../lib/utils/patterns'
import { getFormattedBoosthubDate } from '../../lib/date'
import {
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
} from '../../lib/keyboard'
import { shortcuts } from '../../lib/shortcuts'
import SideNavIcon from '../organisms/Sidebar/SideNavigator/SideNavIcon'
import { StyledTag } from './DocTagsList/styled'

interface DocListItemProps {
  className?: string
  item: SerializedDocWithBookmark
  team: SerializedTeam
  showUpdatedDate?: boolean
  onDeleteHandler?: () => void
  onBookmarkHandler?: () => void
  id: string
  displayTags?: boolean
}

const DocListItem = ({
  className,
  item,
  team,
  showUpdatedDate = false,
  onDeleteHandler,
  onBookmarkHandler,
  id,
  displayTags = true,
}: DocListItemProps) => {
  const [focused, setFocused] = useState(false)

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const dateLabel = useMemo(() => {
    if (item.archivedAt != null) {
      return (
        <div className='date-label'>
          Archived {getFormattedBoosthubDate(item.archivedAt, true)}
        </div>
      )
    }

    if (!showUpdatedDate) {
      return null
    }

    return (
      <div className='date-label'>
        Updated {getFormattedBoosthubDate(item.updatedAt, true)}
      </div>
    )
  }, [item.archivedAt, showUpdatedDate, item.updatedAt])

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
      className={cc(['sideNavItemStyle', className, focused && 'focused'])}
      onBlur={onBlurHandler}
    >
      <div className={cc(['sideNavWrapper'])}>
        <SideNavClickableButtonStyle>
          <SideNavIcon
            mdiPath={mdiCardTextOutline}
            item={item}
            type='doc'
            className='marginLeft'
          />
          <DocLink
            className='itemLink'
            doc={item}
            team={team}
            onFocus={() => setFocused(true)}
            id={id}
          >
            <SideNavLabelStyle>
              {getDocTitle(item, 'Untitled')}
            </SideNavLabelStyle>
            {displayTags && item.tags != null && item.tags.length > 0 && (
              <StyledNavTagsList>
                <div className='wrapper'>
                  {item.tags.slice(0, 3).map((tag) => (
                    <StyledTag className='mb-0 size-s ml-xsmall' key={tag.id}>
                      {tag.text}
                    </StyledTag>
                  ))}
                  {item.tags.length > 3 && (
                    <StyledTag className='mb-0 size-s bg-none'>
                      +{item.tags.length - 3}
                    </StyledTag>
                  )}
                </div>
              </StyledNavTagsList>
            )}
          </DocLink>
        </SideNavClickableButtonStyle>
        <SideNavControlStyle className='controls always'>
          {dateLabel}
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

const Wrapper = styled.div`
  vertical-align: middle;
  display: flex;
  text-align: right;
`

const Icon = styled.button`
  background: none;
  ${baseIconStyle}
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  padding: 0;
  cursor: pointer;
  svg {
    display: inline-block;
    vertical-align: middle;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    transform: 0 !important;
  }
`

export default DocListItem

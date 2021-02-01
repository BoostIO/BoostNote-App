import React, { useMemo, useState } from 'react'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import DocLink from '../../atoms/Link/DocLink'
import { SerializedTeam } from '../../../interfaces/db/team'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
  StyledNavTagsList,
} from '../../organisms/Sidebar/SideNavigator/styled'
import cc from 'classcat'
import { mdiCardTextOutline } from '@mdi/js'
import { getDocTitle } from '../../../lib/utils/patterns'
import { getFormattedBoosthubDate } from '../../../lib/date'
import SideNavIcon from '../../organisms/Sidebar/SideNavigator/SideNavIcon'
import { StyledTag } from '../DocTagsList/styled'
import styled from '../../../lib/styled'
import { TimelineUser } from '../../../pages/[teamId]/timeline'
import Tooltip from '../../atoms/Tooltip'
import { userIconStyle } from '../../../lib/styled/styleFunctions'

interface TimelineListItemProps {
  className?: string
  item: SerializedDocWithBookmark
  team: SerializedTeam
  id: string
  editors: TimelineUser[]
}

const TimelineListItem = ({
  className,
  item,
  team,
  id,
  editors,
}: TimelineListItemProps) => {
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

    return (
      <div className='date-label'>
        Updated {getFormattedBoosthubDate(item.updatedAt, true)}
      </div>
    )
  }, [item.archivedAt, item.updatedAt])

  const ByUsers = useMemo(() => {
    if (editors.length === 0) {
      return null
    }

    return (
      <StyledUsersList>
        <li style={{ marginRight: 4 }}>by</li>
        {editors.map(({ user, icon, color }) => {
          return (
            <li key={user.id}>
              <Tooltip tooltip={user.displayName} style={{ zIndex: 1000 }}>
                <StyledUsersListItem
                  style={{ color: color != null ? color : 'inherit' }}
                >
                  {icon}
                </StyledUsersListItem>
              </Tooltip>
            </li>
          )
        })}
      </StyledUsersList>
    )
  }, [editors])

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
            {item.tags != null && item.tags.length > 0 && (
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
        </SideNavControlStyle>
        {ByUsers}
      </div>
    </SideNavItemStyle>
  )
}

const StyledUsersList = styled.ul`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  list-style: none;
  margin: 0 ${({ theme }) => theme.space.xxsmall}px 0 0;
  padding: 0;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  margin-left: ${({ theme }) => theme.space.xxsmall}px;
  z-index: initial;
  line-height: 24px;
`

const StyledUsersListItem = styled.div`
  ${userIconStyle}
  width: 24px;
  height: 24px;
`

export default TimelineListItem

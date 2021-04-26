import React from 'react'
import { AppUser } from '../../../../../shared/lib/mappers/users'
import styled from '../../../../../shared/lib/styled'
import { AppComponent } from '../../../../../shared/lib/types'
import SidebarHeader from '../atoms/SidebarHeader'
import cc from 'classcat'
import SidebarContextList from '../atoms/SidebarContextList'
import { Emoji } from 'emoji-mart'
import Icon from '../../../../../shared/components/atoms/Icon'
import { overflowEllipsis } from '../../../../../shared/lib/styled/styleFunctions'
import UserIconList from '../../../molecules/UserIconList'
import WithTooltip from '../../../../../shared/components/atoms/WithTooltip'
import { getDateTime } from '../../../../../shared/lib/date'

export type SidebarTimelineRow = {
  label: string
  labelHref: string
  labelOnClick: () => void
  emoji?: string
  defaultIcon?: string
  lastUpdated: string
  lastUpdatedBy: {
    userId: string
    name: string
    iconUrl?: string
    color: string
  }[]
}

interface SidebarTimelineProps {
  rows?: SidebarTimelineRow[]
  users: Map<string, AppUser>
}

const SidebarTimeline: AppComponent<SidebarTimelineProps> = ({
  className,
  children,
  users,
  rows = [],
}) => {
  return (
    <Container className={cc(['sidebar__timeline', className])}>
      <SidebarHeader label='Timeline' />
      <SidebarContextList className='sidebar__timeline__wrapper'>
        {rows.map((row, i) => (
          <WithTooltip
            tooltip={getDateTime(row.lastUpdated, true)}
            key={`sidebar__timeline__row--${i}`}
          >
            <a
              id={`sidebar__timeline__row--${i}`}
              className='sidebar__timeline__row'
              href={row.labelHref}
              onClick={(event) => {
                event.preventDefault()
                row.labelOnClick()
              }}
            >
              <UserIconList
                hideBorders={true}
                limit={3}
                users={(row.lastUpdatedBy || []).map((user) => {
                  const mappedUser = users.get(user.userId)
                  if (mappedUser == null) {
                    return {
                      url: user.iconUrl,
                      size: 22,
                      alt: user.name,
                    }
                  }

                  return {
                    url: mappedUser.iconUrl,
                    size: 22,
                    alt: mappedUser.name,
                  }
                })}
              />
              <div className='sidebar__timeline__row__label'>
                {row.emoji != null ? (
                  <Emoji emoji={row.emoji} set='apple' size={16} />
                ) : row.defaultIcon != null ? (
                  <Icon path={row.defaultIcon} size={16} />
                ) : null}
                <span className='sidebar__timeline__row__label__text'>
                  {row.label}
                </span>
              </div>
            </a>
          </WithTooltip>
        ))}
        {children != null && (
          <div className='sidebar__timeline__content'>{children}</div>
        )}
      </SidebarContextList>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .sidebar__timeline__wrapper {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar__timeline__content {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    text-align: center;
  }

  .sidebar__timeline__row {
    text-decoration: none;
    padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
    cursor: pointer;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    white-space: nowrap;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    border-radius: ${({ theme }) => theme.borders.radius}px;
    align-items: center;
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }
  }

  .sidebar__timeline__row__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    display: flex;
    flex: 1 1 auto;
    text-align: left;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    margin: 0;
    overflow: hidden;
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
    .sidebar__timeline__row__label__text {
      ${overflowEllipsis};
    }
  }

  .sidebar__timeline__row__label,
  .sidebar__timeline__row__label .sidebar__timeline__row__label__text {
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default SidebarTimeline

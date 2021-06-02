import React, { useMemo, useState, useCallback } from 'react'
import { format } from 'date-fns'
import cc from 'classcat'
import { Notification } from '../../../cloud/interfaces/db/notifications'
import Button from '../atoms/Button'
import styled from '../../lib/styled'
import UserIcon from '../../../cloud/components/atoms/UserIcon'
import Icon from '../atoms/Icon'
import { mdiAlertCircleOutline, mdiBellOutline } from '@mdi/js'
import Spinner from '../../../cloud/components/atoms/CustomSpinner'

export type NotificationState =
  | { type: 'loading'; team?: string }
  | { type: 'loaded'; notifications: Notification[]; team: string }
  | { type: 'working'; notifications: Notification[]; team: string }

export interface NotificationListProps {
  state: NotificationState
  getMore: () => void
  onClick?: (notification: Notification) => void
}

const NotificationList = ({
  state,
  getMore,
  onClick,
}: NotificationListProps) => {
  const [tab, setTab] = useState<'inbox' | 'all'>('inbox')
  const notifications = useMemo(() => {
    return state.type != 'loading'
      ? tab == 'inbox'
        ? state.notifications.filter(
            (notification) => notification.viewedAt == null
          )
        : state.notifications
      : []
  }, [state, tab])

  return (
    <NotificationListContainer>
      <div className='notification__list__header'>
        <Button
          className='notification__list__tab__control'
          variant='transparent'
          active={tab === 'inbox'}
          onClick={() => setTab('inbox')}
        >
          Inbox
        </Button>
        <Button
          className='notification__list__tab__control'
          variant='transparent'
          active={tab === 'all'}
          onClick={() => setTab('all')}
        >
          All
        </Button>
        <div className='notification__list__header__spacer'></div>
      </div>
      <div className='notification__list__content'>
        {state.type === 'loading' && (
          <div className='notification__list__loading'>
            <Spinner />
          </div>
        )}
        {state.type !== 'loading' && notifications.length > 0 ? (
          <>
            {' '}
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onClick}
              />
            ))}
            {tab === 'all' && (
              <div className='notification__list__more'>
                {state.type === 'working' ? (
                  <Spinner />
                ) : (
                  <div onClick={getMore}>See more..</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='notification__list__empty'>
            <Icon path={mdiBellOutline} /> No {tab === 'inbox' ? 'new ' : ''}
            notifications
          </div>
        )}
      </div>
    </NotificationListContainer>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}

const smallUserIconStyle = { width: '20px', height: '20px', lineHeight: '17px' }
const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const navigate: React.ReactEventHandler<React.MouseEvent<
    HTMLAnchorElement
  >> = useCallback(
    (ev) => {
      if (onClick != null) {
        ev.stopPropagation()
        ev.preventDefault()
        onClick(notification)
      }
    },
    [onClick, notification]
  )

  return (
    <NotificationItemContainer href={notification.link} onClick={navigate}>
      <div
        className={cc([
          'notification__item__viewed__indicator',
          notification.viewedAt == null &&
            'notification__item__viewed__indicator--unviewed',
        ])}
      ></div>
      {notification.source != null ? (
        <UserIcon style={smallUserIconStyle} user={notification.source} />
      ) : (
        <div className='notification__item__icon'>
          <Icon path={mdiAlertCircleOutline} size={20} />
        </div>
      )}
      <div>
        <div className='notification__item__title'>{notification.title}</div>
        <div className='notification__item__date'>
          {format(notification.createdAt, 'kk:mm MMM Mo')}
        </div>
        <div className='notification__item_content'>{notification.content}</div>
      </div>
    </NotificationItemContainer>
  )
}

const NotificationListContainer = styled.div`
  min-width: 450px;
  min-height: 200px;

  & .notification__list__header {
    display: flex;

    & .notification__list__header__spacer {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
      flex-grow: 1;
      margin: 0;
    }

    & > .notification__list__tab__control {
      padding: 0 ${({ theme }) => theme.sizes.spaces.df}px !important;
      border-radius: 0px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
      margin: 0;
      &.button__state--active {
        border-bottom: 1px solid ${({ theme }) => theme.colors.text.primary};
      }

      &:focus {
        box-shadow: none !important;
      }
    }
  }

  & .notification__list__content {
    display: flex;
    flex-direction: column;
    min-height: 200px;
    max-height: 60vh;
    overflow: auto;
    scrollbar-width: thin;
  }

  & .notification__list__empty,
  .notification__list__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  & .notification__list__more {
    display: flex;
    justify-content: center;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    cursor: default;
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

const NotificationItemContainer = styled.a`
  text-decoration: none;
  padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
  display: flex;
  align-items: baseline;
  color: ${({ theme }) => theme.colors.text.primary};

  & > div {
    &:not(:last-child) {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    &:first-child {
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }

  & .notification__item__viewed__indicator {
    width: ${({ theme }) => theme.sizes.spaces.sm}px;
    height: ${({ theme }) => theme.sizes.spaces.sm}px;
    border-radius: 50%;
    &.notification__item__viewed__indicator--unviewed {
      background-color: ${({ theme }) => theme.colors.variants.tertiary.base};
    }
  }

  & .notification__item__title {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .notification__item__date {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & .notification__item_content {
    white-space: pre-wrap;
    word-break: break-word;
  }

  & .notification__item__icon {
    width: 20px;
    height: 20px;
    transform: translate3d(0, 6px, 0);
  }
`

export default NotificationList

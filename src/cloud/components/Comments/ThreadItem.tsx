import React, { useCallback } from 'react'
import { isToday, format, formatDistanceToNow } from 'date-fns'
import { Thread } from '../../interfaces/db/comments'
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiAlertCircleCheckOutline,
} from '@mdi/js'
import UserIcon from '../UserIcon'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import useThreadActions, {
  ThreadActionProps,
} from '../../lib/hooks/useThreadMenuActions'
import { useContextMenu } from '../../../design/lib/stores/contextMenu'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'

export type ThreadListItemProps = ThreadActionProps & {
  onSelect: (thread: Thread) => void
}

const smallUserIconStyle = { width: '22px', height: '22px', lineHeight: '18px' }
function ThreadItem({ thread, onSelect, ...rest }: ThreadListItemProps) {
  const actions = useThreadActions({ thread, ...rest })
  const { popup } = useContextMenu()
  const { translate } = useI18n()

  const openActionMenu: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      popup(event, actions)
    },
    [actions, popup]
  )

  return (
    <StyledListItem onClick={() => onSelect(thread)}>
      <div className='thread__row'>
        <div className='thread__info__line'>
          <Icon
            size={20}
            className={`thread__status thread__status--${thread.status.type}`}
            path={
              thread.status.type === 'open'
                ? mdiAlertCircleOutline
                : mdiAlertCircleCheckOutline
            }
          />
          <div
            className={`thread__item__context ${
              thread.selection != null
                ? 'thread__item__context--highlighted'
                : ''
            }`}
          >
            {thread.selection != null
              ? thread.context
              : translate(lngKeys.ThreadFullDocLabel)}
          </div>
        </div>
        <div onClick={openActionMenu} className='thread__action'>
          <Icon size={20} path={mdiDotsVertical} />
        </div>
      </div>
      <div>
        <div className='thread__info__line'>
          {thread.contributors.map((user) => (
            <UserIcon key={user.id} style={smallUserIconStyle} user={user} />
          ))}
          {translate(lngKeys.ThreadReplies, { count: thread.commentCount })}
          <span className='thread__info__line__date'>
            {formatDate(thread.lastCommentTime)}
          </span>
        </div>
      </div>
    </StyledListItem>
  )
}

const StyledListItem = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  cursor: default;
  .thread__info__line__date {
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    padding-left: 4px;
  }

  &:hover .thread__action {
    opacity: 1;
  }

  & .thread__row {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  & .thread__info__line {
    display: flex;
    align-items: baseline;
    overflow: hidden;
    & > * {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
    & > .thread__item__context {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.thread__item__context--highlighted {
        color: white;
        background-color: #705400;
      }
    }
  }

  & .thread__status {
    flex-shrink: 0;
    &.thread__status--open {
      color: ${({ theme }) => theme.colors.variants.success.base};
    }

    &.thread__status--closed {
      color: ${({ theme }) => theme.colors.variants.danger.base};
    }

    &.thread__status--outdated {
      color: ${({ theme }) => theme.colors.icon.default};
    }
  }
  & .thread__action {
    height: 20px;
    opacity: 0;
    color: ${({ theme }) => theme.colors.text.subtle};
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

function formatDate(date: Date) {
  return isToday(date)
    ? `at ${format(date, 'KK:mm a')} today`
    : `${formatDistanceToNow(date)} ago`
}

export default ThreadItem

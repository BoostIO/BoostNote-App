import React, { useCallback } from 'react'
import { isToday, format, formatDistanceToNow } from 'date-fns'
import { Thread } from '../../interfaces/db/comments'
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiAlertCircleCheckOutline,
} from '@mdi/js'
import UserIcon from '../atoms/UserIcon'
import { capitalize } from '../../lib/utils/string'
import Icon from '../../../shared/components/atoms/Icon'
import styled from '../../../shared/lib/styled'
import useThreadActions, {
  ThreadActionProps,
} from '../../../shared/lib/hooks/useThreadMenuActions'
import { useContextMenu } from '../../../shared/lib/stores/contextMenu'

type ThreadListItemProps = ThreadActionProps & {
  onSelect: (thread: Thread) => void
}

const smallUserIconStyle = { width: '24px', height: '24px', lineHeight: '20px' }
const extraSmallUserIconStyle = {
  width: '20px',
  height: '20px',
  lineHeight: '16px',
  fontSize: '16px',
}
function ThreadItem({ thread, onSelect, ...rest }: ThreadListItemProps) {
  const actions = useThreadActions({ thread, ...rest })
  const { popup } = useContextMenu()

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
      <div>
        <div className='thread__info__line'>
          <Icon
            size={20}
            className={`thread__status__${thread.status.type}`}
            path={
              thread.status.type === 'open'
                ? mdiAlertCircleOutline
                : mdiAlertCircleCheckOutline
            }
          />
          <span>
            {formatStatus(thread.status)} {thread.status.by != null ? 'by' : ''}
          </span>
          {thread.status.by != null && (
            <UserIcon style={smallUserIconStyle} user={thread.status.by} />
          )}
        </div>
        <div onClick={openActionMenu}>
          <Icon className='thread__action' size={20} path={mdiDotsVertical} />
        </div>
      </div>
      <div>
        <div className='thread__info__line'>
          {thread.contributors.slice(0, 2).map((user) => (
            <UserIcon
              key={user.id}
              user={user}
              style={extraSmallUserIconStyle}
            />
          ))}
          {thread.commentCount} replies {formatDate(thread.lastCommentTime)}
        </div>
      </div>
    </StyledListItem>
  )
}

const StyledListItem = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  cursor: default;

  &:hover .thread__action {
    display: block;
  }

  & > div {
    &:first-child {
      margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    }
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  & .thread__info__line {
    display: flex;
    align-items: center;
    & > * {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  & .thread__status__open {
    color: ${({ theme }) => theme.colors.variants.success.base};
  }

  & .thread__status__closed {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }

  & .thread__status__outdated {
    color: ${({ theme }) => theme.colors.icon.default};
  }

  & .thread__action {
    display: none;
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

function formatStatus({ type, at }: Thread['status']) {
  return `${capitalize(
    type === 'open' ? 'opened' : type
  )} ${formatDistanceToNow(at)} ago`
}

export default ThreadItem

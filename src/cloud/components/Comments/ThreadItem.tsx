import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isToday, format, formatDistanceToNow } from 'date-fns'
import { Thread, Comment } from '../../interfaces/db/comments'
import UserIcon from '../UserIcon'
import styled from '../../../design/lib/styled'
import { ThreadActionProps } from '../../lib/hooks/useThreadMenuActions'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { listThreadComments } from '../../api/comments/comment'
import { SerializedUser } from '../../interfaces/db/user'
import {
  mdiClose,
  mdiMessageReplyTextOutline,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'
import CommentInput from './CommentInput'

export type ThreadListItemProps = ThreadActionProps & {
  onSelect: (thread: Thread) => void
  users: SerializedUser[]
  updateComment: (comment: Comment, message: string) => Promise<any>
}

const smallUserIconStyle = { width: '28px', height: '28px', lineHeight: '26px' }

function ThreadItem({
  thread,
  onSelect,
  onDelete,
  updateComment,
  users,
}: ThreadListItemProps) {
  const { translate } = useI18n()
  const [editing, setEditing] = useState(false)

  const [threadComments, setThreadComments] = useState<Comment[] | null>(null)
  const [showingContextMenu, setShowingContextMenu] = useState<boolean>(false)

  const reloadComments = useCallback(() => {
    listThreadComments({ id: thread.id }).then((comments) => {
      setThreadComments(comments)
    })
  }, [thread.id])

  useEffect(() => {
    reloadComments()
  }, [reloadComments, thread.id])

  const showReplyForm = useCallback(() => {
    if (threadComments == null || threadComments.length > 1) {
      return
    }

    setShowingContextMenu(true)
  }, [threadComments])

  const hideReplyForm = useCallback(() => {
    setShowingContextMenu(false)
  }, [])

  const submitComment = useCallback(
    async (message: string) => {
      if (threadComments == null || threadComments.length == 0) {
        return
      }
      await updateComment(threadComments[0], message)
      setEditing(false)
      reloadComments()
    },
    [reloadComments, threadComments, updateComment]
  )

  const onCommentDelete = useCallback(
    (thread) => {
      onDelete(thread)
      reloadComments()
    },
    [onDelete, reloadComments]
  )

  const threadCommentedUser = useMemo(() => {
    if (threadComments == null || threadComments.length == 0) {
      return
    }

    for (const user of users) {
      if (threadComments[0].user.id == user.id) {
        return user
      }
    }

    return threadComments[0].user
  }, [threadComments, users])

  return (
    <StyledListItem>
      <div
        className={'thread'}
        onMouseEnter={showReplyForm}
        onMouseLeave={hideReplyForm}
      >
        <div className={'thread__info'}>
          <div className='thread__info__line'>
            <UserIcon
              className={'thread__info__line__icon'}
              style={smallUserIconStyle}
              user={
                threadCommentedUser != null
                  ? threadCommentedUser
                  : thread.contributors[0]
              }
            />
          </div>
          {threadComments && threadComments.length > 0 && (
            <div className={'thread__comment__line'}>
              <span>{thread.contributors[0].displayName}</span>
              <span className='thread__comment__line__date'>
                {formatDate(thread.lastCommentTime)}
              </span>
              {editing ? (
                <CommentInput
                  placeholder={'Reply'}
                  autoFocus={true}
                  onSubmit={submitComment}
                  value={threadComments[0].message}
                  users={users}
                />
              ) : (
                <div className='thread__comment__line__first__comment'>
                  <span>{threadComments[0].message}</span>
                </div>
              )}

              {threadComments && threadComments.length > 1 && (
                <div className={'thread__comment__line_more_replies_container'}>
                  <div
                    onClick={() => onSelect(thread)}
                    className={'thread__comment__line__replies__link'}
                  >
                    {translate(lngKeys.ThreadReplies, {
                      count: thread.commentCount,
                    })}
                  </div>
                  <span className='thread__comment__line__date'>
                    {formatDate(thread.lastCommentTime)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {editing ? (
          <div onClick={() => setEditing(false)}>
            <Icon path={mdiClose} />
          </div>
        ) : (
          showingContextMenu && (
            <div className={'comment__meta__actions'}>
              <div
                onClick={() => onSelect(thread)}
                className='comment__meta__actions__comment'
              >
                <Icon size={20} path={mdiMessageReplyTextOutline} />
              </div>
              <div
                onClick={() => setEditing(true)}
                className='comment__meta__actions__edit'
              >
                <Icon size={20} path={mdiPencil} />
              </div>
              <div
                onClick={() => onCommentDelete(thread)}
                className='comment__meta__actions__remove'
              >
                <Icon size={20} path={mdiTrashCanOutline} />
              </div>
            </div>
          )
        )}
      </div>
    </StyledListItem>
  )
}

const StyledListItem = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
  cursor: default;

  .thread {
    display: flex;
    flex-direction: row;

    justify-content: space-between;
    position: relative;
  }

  .thread__info {
    display: flex;
    width: 100%;
  }

  & .thread__row {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  & .thread__info__line {
    display: flex;

    .thread__info__line__icon {
      width: 39px;
    }

    & > * {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  & .thread__comment__line {
    width: 100%;
    align-items: center;

    & .thread__comment__line__replies__link {
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
      align-self: center;
      color: ${({ theme }) => theme.colors.text.link};

      &:hover {
        cursor: pointer;
      }
    }

    & .thread__comment__line__icon {
      width: 39px;
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }

    & .thread__comment__line__date {
      align-self: center;
      color: ${({ theme }) => theme.colors.text.subtle};
      padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }

    & .thread__comment__line__first__comment {
      margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    }

    & .thread__comment__line_more_replies_container {
      display: flex;
      align-items: center;
    }
  }

  .comment__meta__actions {
    position: absolute;
    right: 12px;
    top: -8px;
    display: flex;
    flex-direction: row;
    justify-self: flex-start;
    align-self: center;

    gap: 4px;
    border-radius: ${({ theme }) => theme.borders.radius}px;

    background-color: ${({ theme }) => theme.colors.background.primary};;

    .comment__meta__actions__comment,
    .comment__meta__actions__edit,
    .comment__meta__actions__remove {
      height: 20px;
      margin: 5px;

      color: ${({ theme }) => theme.colors.text.subtle};

      &:hover {
        cursor: pointer;
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }
`

function formatDate(date: Date) {
  return isToday(date)
    ? `Today at ${format(date, 'KK:mm a')}`
    : `Last reply ${formatDistanceToNow(date)} ago`
}

export default ThreadItem

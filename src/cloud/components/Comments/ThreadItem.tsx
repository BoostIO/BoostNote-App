import React, { useCallback, useMemo, useState } from 'react'
import { isToday, format, formatDistanceToNow } from 'date-fns'
import { Thread, Comment } from '../../interfaces/db/comments'
import UserIcon from '../UserIcon'
import styled from '../../../design/lib/styled'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { SerializedUser } from '../../interfaces/db/user'
import {
  mdiClose,
  mdiEmoticonHappyOutline,
  mdiMessageReplyTextOutline,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'
import CommentInput from './CommentInput'
import CommentReactions from './CommentReactions'
import EmojiPickHandler from './EmojiPickHandler'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'

type ThreadListItemProps = {
  onSelect: (thread: Thread) => void
  users: SerializedUser[]
  updateComment: (comment: Comment, message: string) => Promise<any>
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  user?: SerializedUser
  onCommentDelete: (comment: Comment) => Promise<any>
  thread: Thread
  onDelete: (thread: Thread) => any
}

const smallUserIconStyle = { width: '28px', height: '28px', lineHeight: '26px' }

const ThreadItem = ({
  thread,
  onSelect,
  onDelete,
  updateComment,
  users,
  addReaction,
  removeReaction,
  user,
  onCommentDelete,
}: ThreadListItemProps) => {
  const [editing, setEditing] = useState(false)
  const { messageBox } = useDialog()
  const { translate } = useI18n()

  const [showingContextMenu, setShowingContextMenu] = useState<boolean>(false)

  const showContextMenu = useCallback(() => {
    setShowingContextMenu(true)
  }, [])

  const hideContextMenu = useCallback(() => {
    setShowingContextMenu(false)
  }, [])

  const submitComment = useCallback(
    async (message: string) => {
      if (thread.initialComment == null) {
        return
      }
      await updateComment(thread.initialComment, message)
      setEditing(false)
    },
    [thread.initialComment, updateComment]
  )

  const replyCount = useMemo(() => {
    return thread.initialComment == null
      ? thread.commentCount
      : thread.commentCount - 1
  }, [thread.commentCount, thread.initialComment])

  const onThreadDelete = useCallback(
    async (thread: Thread) => {
      if (thread == null) {
        return
      }

      if (thread.initialComment == null || replyCount === 0) {
        messageBox({
          title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
            label: 'Thread',
          }),
          message: translate(lngKeys.ModalsDeleteThreadDisclaimer),
          iconType: DialogIconTypes.Warning,
          buttons: [
            {
              variant: 'secondary',
              label: translate(lngKeys.GeneralCancel),
              cancelButton: true,
              defaultButton: true,
            },
            {
              variant: 'danger',
              label: translate(lngKeys.GeneralDelete),
              onClick: async () => {
                await onDelete(thread)
              },
            },
          ],
        })
      } else {
        messageBox({
          title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
            label: 'Comment',
          }),
          message: translate(lngKeys.ModalsDeleteCommentDisclaimer),
          iconType: DialogIconTypes.Warning,
          buttons: [
            {
              variant: 'secondary',
              label: translate(lngKeys.GeneralCancel),
              cancelButton: true,
              defaultButton: true,
            },
            {
              variant: 'danger',
              label: translate(lngKeys.GeneralDelete),
              onClick: async () => {
                if (thread.initialComment == null) {
                  return
                }
                await onCommentDelete(thread.initialComment)
              },
            },
          ],
        })
      }
    },
    [messageBox, onCommentDelete, onDelete, replyCount, translate]
  )

  const selectThread = useCallback(() => {
    onSelect(thread)
  }, [onSelect, thread])

  const contextMenuItems = useCallback(() => {
    if (thread.initialComment == null) {
      return (
        <div className='comment__meta__actions'>
          <div
            onClick={selectThread}
            className='comment__meta__actions__comment'
          >
            <Icon size={20} path={mdiMessageReplyTextOutline} />
          </div>
          <div
            onClick={() => onThreadDelete(thread)}
            className='comment__meta__actions__remove'
          >
            <Icon size={20} path={mdiTrashCanOutline} />
          </div>
        </div>
      )
    }

    const editable = user != null && thread.initialComment.user.id == user.id

    if (editable) {
      return (
        <div className='comment__meta__actions'>
          {thread.initialComment != null && (
            <EmojiPickHandler
              className='comment__meta__actions__emoji'
              comment={thread.initialComment}
              addReaction={addReaction}
              removeReaction={removeReaction}
              user={user}
            >
              <Icon size={20} path={mdiEmoticonHappyOutline} />
            </EmojiPickHandler>
          )}
          <div
            onClick={selectThread}
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
            onClick={() => onThreadDelete(thread)}
            className='comment__meta__actions__remove'
          >
            <Icon size={20} path={mdiTrashCanOutline} />
          </div>
        </div>
      )
    } else {
      return (
        <div className='comment__meta__actions'>
          {thread.initialComment != null && (
            <EmojiPickHandler
              className='comment__meta__actions__emoji'
              comment={thread.initialComment}
              addReaction={addReaction}
              removeReaction={removeReaction}
              user={user}
            >
              <Icon size={20} path={mdiEmoticonHappyOutline} />
            </EmojiPickHandler>
          )}
          <div
            onClick={selectThread}
            className='comment__meta__actions__comment'
          >
            <Icon size={20} path={mdiMessageReplyTextOutline} />
          </div>
        </div>
      )
    }
  }, [thread, user, addReaction, removeReaction, selectThread, onThreadDelete])

  return (
    <StyledListItem>
      <div
        className='thread'
        onMouseEnter={showContextMenu}
        onMouseLeave={hideContextMenu}
      >
        <div className='thread__info'>
          <div className='thread__info__line'>
            <UserIcon
              className='thread__info__line__icon'
              style={smallUserIconStyle}
              user={
                thread.initialComment != null
                  ? thread.initialComment.user
                  : thread.contributors[0]
              }
            />
          </div>
          {thread.initialComment == null ? (
            <div className='thread__comment__line'>
              <div className='thread__comment__deleted__line'>
                This comment has been deleted.
              </div>
              {replyCount > 0 && (
                <ThreadReplyInfo
                  count={replyCount}
                  selectThread={selectThread}
                  lastCommentTime={thread.lastCommentTime}
                />
              )}
            </div>
          ) : (
            <div className='thread__comment__line'>
              <span>{thread.initialComment.user.displayName}</span>
              <span className='thread__comment__line__date'>
                {formatThreadDate(new Date(thread.initialComment.createdAt))}
              </span>
              {editing ? (
                <CommentInput
                  placeholder='Reply'
                  autoFocus={true}
                  onSubmit={submitComment}
                  value={thread.initialComment.message}
                  users={users}
                />
              ) : (
                <div className='thread__comment__line__first__comment'>
                  <span>{thread.initialComment.message}</span>
                </div>
              )}

              <CommentReactions
                comment={thread.initialComment}
                addReaction={addReaction}
                removeReaction={removeReaction}
                users={users}
                user={user}
              />

              {replyCount > 0 && (
                <ThreadReplyInfo
                  count={replyCount}
                  selectThread={selectThread}
                  lastCommentTime={thread.lastCommentTime}
                />
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div onClick={() => setEditing(false)}>
            <Icon path={mdiClose} />
          </div>
        ) : (
          showingContextMenu && contextMenuItems()
        )}
      </div>
    </StyledListItem>
  )
}

const ThreadReplyInfo = ({
  count,
  lastCommentTime,
  selectThread,
}: {
  count: number
  lastCommentTime: Date
  selectThread: () => void
}) => {
  const { translate } = useI18n()
  return (
    <div className='thread__comment__line_more_replies_container'>
      <div
        onClick={selectThread}
        className='thread__comment__line__replies__link'
      >
        {translate(lngKeys.ThreadReplies, {
          count,
        })}
      </div>
      <span className='thread__comment__line__date'>
        {formatLastReplyDate(lastCommentTime)}
      </span>
    </div>
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

    & .thread__info__line__comment__removed__icon {
      color: ${({ theme }) => theme.colors.text.subtle};
    }

    .thread__info__line__icon {
      width: 39px;
    }

    & > * {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  .comment__add__reaction__button {
    color: #9e9e9e;
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-radius: 6px;
    padding: 4px 8px;
  }

  .thread__comment__reactions {
    display: flex;
    flex-direction: row;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;

    .thread__comment__reaction {
      display: flex;
      flex-direction: row;

      .thread__comment__reaction_count {
        padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
        padding-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
        font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      }

      .thread__comment__reaction_emoji {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
        border-radius: 6px;
        padding: 4px;
      }
    }
  }

  & .thread__comment__line {
    width: 100%;
    align-items: center;

    & .thread__comment__deleted__line {
      color: ${({ theme }) => theme.colors.text.subtle};
    }

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

    background-color: ${({ theme }) => theme.colors.background.primary};

    .comment__meta__actions__comment,
    .comment__meta__actions__edit,
    .comment__meta__actions__remove,
    .comment__meta__actions__emoji {
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

function formatThreadDate(date: Date) {
  return isToday(date)
    ? `Today at ${format(date, 'KK:mm a')}`
    : `${formatDistanceToNow(date)} ago`
}

function formatLastReplyDate(date: Date) {
  return isToday(date)
    ? `Today at ${format(date, 'KK:mm a')}`
    : `Last reply ${formatDistanceToNow(date)} ago`
}

export default ThreadItem

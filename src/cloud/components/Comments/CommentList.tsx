import React, { useState, useCallback, useMemo } from 'react'
import { Comment } from '../../interfaces/db/comments'
import styled from '../../../design/lib/styled'
import UserIcon from '../UserIcon'
import { format } from 'date-fns'
import Icon from '../../../design/components/atoms/Icon'
import {
  mdiClose,
  mdiEmoticonHappyOutline,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js'
import { SerializedUser } from '../../interfaces/db/user'
import CommentInput from './CommentInput'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { toText } from '../../lib/comments'
import CommentReactions from './CommentReactions'
import EmojiPickHandler from './EmojiPickHandler'

interface CommentThreadProps {
  comments: Comment[]
  className: string
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => Promise<any>
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  user?: SerializedUser
  users: SerializedUser[]
}

function CommentList({
  comments,
  className,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction,
  user,
  users,
}: CommentThreadProps) {
  const sorted = useMemo(() => {
    return sortBy(prop('createdAt'), comments)
  }, [comments])

  return (
    <div className={className}>
      {sorted.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            updateComment={updateComment}
            deleteComment={deleteComment}
            editable={user != null && comment.user.id === user.id}
            users={users}
            addReaction={addReaction}
            removeReaction={removeReaction}
            user={user}
          />
        </div>
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => Promise<any>
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  editable?: boolean
  users: SerializedUser[]
  user?: SerializedUser
}

const smallUserIconStyle = { width: '28px', height: '28px', lineHeight: '26px' }

export interface EmojiReactionData {
  id: string
  emoji: string
  count: number
  userIds: string[]
}

export function CommentItem({
  comment,
  editable,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction,
  users,
  user,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const [showingContextMenu, setShowingContextMenu] = useState<boolean>(false)

  const submitComment = useCallback(
    async (message: string) => {
      await updateComment(comment, message)
      setEditing(false)
    },
    [comment, updateComment]
  )

  const content = useMemo(() => {
    return toText(comment.message, users)
  }, [comment.message, users])

  const contextMenuItems = useCallback(() => {
    if (editable) {
      return (
        <div className={'comment__meta__actions'}>
          <EmojiPickHandler
            className='comment__meta__actions__emoji'
            comment={comment}
            addReaction={addReaction}
            removeReaction={removeReaction}
            user={user}
          >
            <Icon size={20} path={mdiEmoticonHappyOutline} />
          </EmojiPickHandler>
          <div
            onClick={() => setEditing(true)}
            className='comment__meta__actions__edit'
          >
            <Icon size={20} path={mdiPencil} />
          </div>
          <div
            onClick={() => deleteComment(comment)}
            className='comment__meta__actions__remove'
          >
            <Icon size={20} path={mdiTrashCanOutline} />
          </div>
        </div>
      )
    } else {
      return (
        <div className={'comment__meta__actions'}>
          <EmojiPickHandler
            className='comment__meta__actions__emoji'
            comment={comment}
            addReaction={addReaction}
            removeReaction={removeReaction}
            user={user}
          >
            <Icon size={20} path={mdiEmoticonHappyOutline} />
          </EmojiPickHandler>
        </div>
      )
    }
  }, [addReaction, comment, deleteComment, editable, removeReaction, user])

  return (
    <CommentItemContainer>
      <div className='comment__icon'>
        <UserIcon style={smallUserIconStyle} user={comment.user} />{' '}
      </div>
      <div
        className='comment__content'
        onMouseEnter={() => setShowingContextMenu(true)}
        onMouseLeave={() => setShowingContextMenu(false)}
      >
        <div className='comment__meta'>
          <span className='comment__meta__name'>
            {comment.user.displayName}
          </span>
          <span className='comment__meta__date'>
            {format(comment.createdAt, 'hh:mmaaa MMM do')}
          </span>

          {editing ? (
            <div onClick={() => setEditing(false)}>
              <Icon path={mdiClose} />
            </div>
          ) : (
            showingContextMenu && contextMenuItems()
          )}
        </div>
        {editing ? (
          <CommentInput
            placeholder={'Reply'}
            autoFocus={true}
            onSubmit={submitComment}
            value={comment.message}
            users={users}
          />
        ) : (
          <>
            <div className='comment__message'>{content}</div>
            <CommentReactions
              comment={comment}
              addReaction={addReaction}
              removeReaction={removeReaction}
              users={users}
              user={user}
            />
          </>
        )}
      </div>
    </CommentItemContainer>
  )
}

const CommentItemContainer = styled.div`
  display: flex;

  .comment__icon {
    width: 39px;
  }

  .comment__content {
    width: 100%;
  }

  .comment__meta {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    position: relative;

    & svg {
      color: ${({ theme }) => theme.colors.icon.default};

      &:hover {
        color: ${({ theme }) => theme.colors.icon.active};
      }
    }
  }

  .comment__meta__date {
    flex-grow: 1;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .comment__meta__name {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    font-weight: bold;
  }

  .comment__meta__menu {
    display: none;
    height: 18px;

    &:hover {
      cursor: pointer;
    }
  }

  .comment__add__reaction__button {
    color: #9e9e9e;
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-radius: 6px;
    padding: 4px 8px;
  }

  .comment__message {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment__meta__actions {
    display: flex;
    flex-direction: row;
    justify-self: flex-end;
    align-self: center;
    position: absolute;
    right: 7px;

    padding: 4px;
    gap: 4px;
    border-radius: ${({ theme }) => theme.borders.radius}px;

    background-color: ${({ theme }) => theme.colors.background.primary};

    .comment__meta__actions__edit,
    .comment__meta__actions__remove,
    .comment__meta__actions__emoji {
      height: 20px;
      margin: 3px;

      color: ${({ theme }) => theme.colors.text.subtle};

      &:hover {
        cursor: pointer;
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }
`

export default CommentList

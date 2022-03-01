import React, { useState, useCallback, useMemo } from 'react'
import { Comment } from '../../interfaces/db/comments'
import styled from '../../../design/lib/styled'
import UserIcon from '../UserIcon'
import { format } from 'date-fns'
import Icon from '../../../design/components/atoms/Icon'
import { mdiClose, mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import { SerializedUser } from '../../interfaces/db/user'
import CommentInput from './CommentInput'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { toText } from '../../lib/comments'

interface CommentThreadProps {
  comments: Comment[]
  className: string
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => void
  user?: SerializedUser
  users: SerializedUser[]
}

function CommentList({
  comments,
  className,
  updateComment,
  deleteComment,
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
          />
        </div>
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => void
  editable?: boolean
  users: SerializedUser[]
}

const smallUserIconStyle = { width: '28px', height: '28px', lineHeight: '26px' }

export function CommentItem({
  comment,
  editable,
  updateComment,
  deleteComment,
  users,
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
          {editable &&
            (editing ? (
              <div onClick={() => setEditing(false)}>
                <Icon path={mdiClose} />
              </div>
            ) : (
              showingContextMenu && (
                <div className={'comment__meta__actions'}>
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
            ))}
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
          <div className='comment__message'>{content}</div>
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

    background-color: #1e2024;

    .comment__meta__actions__edit,
    .comment__meta__actions__remove {
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

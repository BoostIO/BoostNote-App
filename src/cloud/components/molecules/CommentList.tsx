import React, { useState, useCallback } from 'react'
import { Comment } from '../../interfaces/db/comments'
import styled from '../../../shared/lib/styled'
import UserIcon from '../atoms/UserIcon'
import { format } from 'date-fns'
import Icon from '../../../shared/components/atoms/Icon'
import { mdiDotsVertical, mdiClose } from '@mdi/js'
import { SerializedUser } from '../../interfaces/db/user'
import {
  useContextMenu,
  MenuTypes,
} from '../../../shared/lib/stores/contextMenu'
import CommentInput from './CommentInput'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'

interface CommentThreadProps {
  comments: Comment[]
  className: string
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => Promise<any>
  user?: SerializedUser
}

// unnecessary, move up and rename file to CommentItem
function CommentList({
  comments,
  className,
  updateComment,
  deleteComment,
  user,
}: CommentThreadProps) {
  return (
    <div className={className}>
      {sortBy(prop('createdAt'), comments).map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          updateComment={updateComment}
          deleteComment={deleteComment}
          editable={user != null && comment.user.id === user.id}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => Promise<any>
  editable?: boolean
}

const smallUserIconStyle = { width: '32px', height: '32px', lineHeight: '28px' }
export function CommentItem({
  comment,
  editable,
  updateComment,
  deleteComment,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const { popup } = useContextMenu()

  const openContextMenu: React.MouseEventHandler = useCallback(
    (event) => {
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'Edit',
          onClick: () => setEditing(true),
        },
        {
          type: MenuTypes.Normal,
          label: 'Delete',
          onClick: () => deleteComment(comment),
        },
      ])
    },
    [popup, comment, deleteComment]
  )

  const submitComment = useCallback(
    async (message: string) => {
      await updateComment(comment, message)
      setEditing(false)
    },
    [comment, updateComment]
  )

  return (
    <CommentItemContainer>
      <div className='comment__icon'>
        <UserIcon style={smallUserIconStyle} user={comment.user} />{' '}
      </div>
      <div className='comment__content'>
        <div className='comment__meta'>
          <strong>{comment.user.displayName}</strong>
          <span className='comment__meta__date'>
            {format(comment.createdAt, 'Mo MMMM hh:mmaaa')}
          </span>
          {editable &&
            (editing ? (
              <div onClick={() => setEditing(false)}>
                <Icon path={mdiClose} />
              </div>
            ) : (
              <div onClick={openContextMenu} className='comment__meta__menu'>
                <Icon path={mdiDotsVertical} />
              </div>
            ))}
        </div>
        {editing ? (
          <CommentInput
            autoFocus={true}
            onSubmit={submitComment}
            value={comment.message}
          />
        ) : (
          <div className='comment__message'>{comment.message}</div>
        )}
      </div>
    </CommentItemContainer>
  )
}

const CommentItemContainer = styled.div`
  display: flex;

  .comment__icon {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .comment__meta {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    & :not(:last-child) {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
    & .comment__meta__date {
      color: ${({ theme }) => theme.colors.text.subtle};
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      flex-grow: 1;
    }
    & svg {
      color: ${({ theme }) => theme.colors.icon.default}
      &:hover {
        color: ${({ theme }) => theme.colors.icon.active}
      }
    }
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
`

export default CommentList

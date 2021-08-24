import React, { useState, useCallback, useMemo } from 'react'
import { Comment } from '../../interfaces/db/comments'
import styled from '../../../design/lib/styled'
import UserIcon from '../UserIcon'
import { format } from 'date-fns'
import Icon from '../../../design/components/atoms/Icon'
import { mdiDotsVertical, mdiClose } from '@mdi/js'
import { SerializedUser } from '../../interfaces/db/user'
import {
  useContextMenu,
  MenuTypes,
} from '../../../design/lib/stores/contextMenu'
import CommentInput from './CommentInput'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { toText } from '../../lib/comments'

interface CommentThreadProps {
  comments: Comment[]
  className: string
  updateComment: (comment: Comment, message: string) => Promise<any>
  deleteComment: (comment: Comment) => Promise<any>
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
        <CommentItem
          key={comment.id}
          comment={comment}
          updateComment={updateComment}
          deleteComment={deleteComment}
          editable={user != null && comment.user.id === user.id}
          users={users}
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
  users: SerializedUser[]
}

const smallUserIconStyle = { width: '32px', height: '32px', lineHeight: '28px' }
export function CommentItem({
  comment,
  editable,
  updateComment,
  deleteComment,
  users,
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

  const content = useMemo(() => {
    return toText(comment.message, users)
  }, [comment.message, users])

  return (
    <CommentItemContainer>
      <div className='comment__icon'>
        <UserIcon style={smallUserIconStyle} user={comment.user} />{' '}
      </div>
      <div className='comment__content'>
        <div className='comment__meta'>
          <span className='comment__meta__name'>
            {comment.user.displayName}
          </span>
          <span className='comment__meta__date'>
            {format(comment.createdAt, 'do MMMM hh:mmaaa')}
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
    width: 38px;
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .comment__content {
    width: 100%;
  }

  .comment__meta {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;

    & svg {
      color: ${({ theme }) => theme.colors.icon.default}

      &:hover {
        color: ${({ theme }) => theme.colors.icon.active}
      }
    }
  }

  .comment__meta__date {
    flex-grow: 1;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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
`

export default CommentList

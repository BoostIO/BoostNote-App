import React from 'react'
import { Comment } from '../../interfaces/db/comments'
import styled from '../../../shared/lib/styled'
import UserIcon from '../atoms/UserIcon'
import { format } from 'date-fns'

interface CommentThreadProps {
  comments: Comment[]
  className: string
}

// unnecessary, move up and rename file to CommentItem
function CommentList({ comments, className }: CommentThreadProps) {
  return (
    <div className={className}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
}

const smallUserIconStyle = { width: '24px', height: '24px', lineHeight: '20px' }
export function CommentItem({ comment }: CommentItemProps) {
  return (
    <CommentItemContainer>
      <div className='comment__meta'>
        <UserIcon style={smallUserIconStyle} user={comment.user} />{' '}
        <strong>{comment.user.displayName}</strong>
        <span className='comment__meta__date'>
          {format(comment.createdAt, 'Mo MMMM hh:mmaaa')}
        </span>
      </div>
      <div className='comment__message'>{comment.message}</div>
    </CommentItemContainer>
  )
}

const CommentItemContainer = styled.div`
  & .comment__meta {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    & :not(:last-child) {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
    & .comment__meta__date {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  & .comment__message {
    white-space: pre-wrap;
  }
`

export default CommentList

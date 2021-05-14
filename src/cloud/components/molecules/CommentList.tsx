import React, { useState, useCallback } from 'react'
import { Comment } from '../../interfaces/db/comments'
import Button from '../../../shared/components/atoms/Button'
import styled from '../../../shared/lib/styled'
import Flexbox from '../atoms/Flexbox'
import UserIcon from '../atoms/UserIcon'
import { format } from 'date-fns'

interface CommentThreadProps {
  comments: Comment[]
}

function CommentList({ comments }: CommentThreadProps) {
  return (
    <ThreadContainer>
      <div>
        <div className='comment__list'>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
        <CommentInput onSubmit={(cm) => console.log(cm)} />
      </div>
    </ThreadContainer>
  )
}

const ThreadContainer = styled.div`
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  & .comment__list {
    & > div {
      margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }
`

interface CommentItemProps {
  comment: Comment
}

const smallUserIconStyle = { width: '24px', height: '24px', lineHeight: '20px' }
function CommentItem({ comment }: CommentItemProps) {
  return (
    <CommentItemContainer>
      <div className='comment__meta'>
        <UserIcon style={smallUserIconStyle} user={comment.user} />{' '}
        <strong>{comment.user.displayName}</strong>
        <span>{format(comment.createdAt, 'Mo MMMM hh:mmaaa')}</span>
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
    & .comment__username {
      font-weight: bold;
    }
  }

  & .comment__message {
    white-space: pre-wrap;
  }
`

interface CommentInputProps {
  onSubmit: (comment: string) => any
}

function CommentInput({ onSubmit }: CommentInputProps) {
  const [comment, setComment] = useState('')

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        ev.stopPropagation()

        if (ev.shiftKey) {
          setComment((val) => `${val}\n`)
        } else {
          onSubmit(comment)
        }
      }
    },
    [comment, onSubmit]
  )

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      setComment(ev.target.value)
    },
    []
  )

  return (
    <InputContainer>
      <textarea value={comment} onChange={onChange} onKeyDown={onKeyDown} />
      <Flexbox justifyContent='flex-end'>
        <Button onClick={() => onSubmit(comment)}>Post</Button>
      </Flexbox>
    </InputContainer>
  )
}

const InputContainer = styled.div`
  width: 100%;
  & textarea {
    resize: none;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 60px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: white;
  }
`

export default CommentList

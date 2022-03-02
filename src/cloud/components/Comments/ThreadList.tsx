import React from 'react'
import ThreadItem from './ThreadItem'
import { Comment, Thread } from '../../interfaces/db/comments'
import {
  highlightComment,
  unhighlightComment,
} from '../../../design/lib/utils/comments'
import styled from '../../../design/lib/styled'
import { SerializedUser } from '../../interfaces/db/user'
import { useMemo } from 'react'

interface ThreadListProps {
  onSelect: (thread: Thread) => void
  onDelete: (thread: Thread) => any
  users: SerializedUser[]
  threads: Thread[]
  updateComment: (comment: Comment, message: string) => Promise<any>
  addReaction: (comment: Comment, emoji: string) => Promise<any>
  removeReaction: (comment: Comment, reactionId: string) => Promise<any>
  user?: SerializedUser
  onCommentDelete: (comment: Comment) => Promise<any>
}

function ThreadList({
  threads,
  onSelect,
  onDelete,
  users,
  updateComment,
  addReaction,
  removeReaction,
  user,
  onCommentDelete,
}: ThreadListProps) {
  const sortedThreads = useMemo(() => {
    return threads.slice().sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [threads])

  return (
    <Container>
      {sortedThreads.map((thread) => (
        <div
          key={thread.id}
          onMouseOver={highlightComment(thread.id)}
          onMouseOut={unhighlightComment(thread.id)}
          className='thread__list__item'
        >
          <ThreadItem
            thread={thread}
            onSelect={onSelect}
            onDelete={onDelete}
            onCommentDelete={onCommentDelete}
            users={users}
            updateComment={updateComment}
            addReaction={addReaction}
            removeReaction={removeReaction}
            user={user}
          />
        </div>
      ))}
    </Container>
  )
}

const Container = styled.div`
  & > div {
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }
  }
`

export default ThreadList

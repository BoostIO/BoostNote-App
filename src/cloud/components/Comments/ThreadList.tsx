import React from 'react'
import ThreadItem, { ThreadListItemProps } from './ThreadItem'
import { Comment, Thread } from '../../interfaces/db/comments'
import {
  highlightComment,
  unhighlightComment,
} from '../../../design/lib/utils/comments'
import styled from '../../../design/lib/styled'

interface ThreadListProps extends Omit<ThreadListItemProps, 'thread'> {
  threads: Thread[]
  updateComment: (comment: Comment, message: string) => Promise<any>
}

function ThreadList({
  threads,
  onSelect,
  onDelete,
  users,
  updateComment,
}: ThreadListProps) {
  return (
    <Container>
      {threads.map((thread) => (
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
            users={users}
            updateComment={updateComment}
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

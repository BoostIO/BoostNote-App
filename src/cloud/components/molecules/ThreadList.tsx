import React, { useMemo } from 'react'
import ThreadItem, { ThreadListItemProps } from '../molecules/ThreadItem'
import { Thread } from '../../interfaces/db/comments'
import { sortBy } from 'ramda'
import {
  highlightComment,
  unhighlightComment,
} from '../../../shared/lib/utils/comments'
import styled from '../../../shared/lib/styled'

interface ThreadListProps extends Omit<ThreadListItemProps, 'thread'> {
  threads: Thread[]
}

function ThreadList({
  threads,
  onSelect,
  onOpen,
  onClose,
  onDelete,
}: ThreadListProps) {
  const sorted = useMemo(() => {
    return sortBy((thread) => thread.lastCommentTime, threads).reverse()
  }, [threads])

  return (
    <Container>
      {sorted.map((thread) => (
        <div
          key={thread.id}
          onMouseOver={highlightComment(thread.id)}
          onMouseOut={unhighlightComment(thread.id)}
          className='thread__list__item'
        >
          <ThreadItem
            thread={thread}
            onSelect={onSelect}
            onOpen={onOpen}
            onClose={onClose}
            onDelete={onDelete}
          />
        </div>
      ))}
    </Container>
  )
}

const Container = styled.div`
  & > div {
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
  }
`

export default ThreadList

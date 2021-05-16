import React, { useState, useEffect, useMemo } from 'react'
import { zIndexModalsBackground } from './Topbar/Controls/ControlsContextMenu/styled'
import { docContextWidth } from './Topbar/Controls/ControlsContextMenu/DocContextMenu'
import ThreadList from '../molecules/ThreadItem'
import { Thread, Comment } from '../../interfaces/db/comments'
import Spinner from '../../../shared/components/atoms/Spinner'
import { mdiArrowLeftBoldBoxOutline, mdiPlusBoxOutline } from '@mdi/js'
import Icon from '../../../shared/components/atoms/Icon'
import CommentList from '../molecules/CommentList'
import { useComments } from '../../../shared/lib/stores/comments'
import styled from '../../../shared/lib/styled'
import CommentInput from '../molecules/CommentInput'
import ThreadActionButton from '../molecules/ThreadActionButton'
import Button from '../../../shared/components/atoms/Button'

type Mode =
  | { type: 'thread_list' }
  | { type: 'thread'; thread: Thread }
  | {
      type: 'new'
      context?: string
      selection?: Thread['selection']
    }

interface CommentManagerProps {
  threads: Thread[] | null
  mode?: Mode
  docId: string
}

function CommentManager({ docId, threads, mode }: CommentManagerProps) {
  const [tabMode, setTabMode] = useState<Mode>({ type: 'thread_list' })
  const {
    observeComments,
    commentActions: { create: createComment },
    threadActions,
  } = useComments()
  const [comments, setComments] = useState<Comment[] | null>(null)

  useEffect(() => {
    setTabMode(mode != null ? mode : { type: 'thread_list' })
  }, [mode])

  useEffect(() => {
    setTabMode((prev) => {
      if (threads == null) {
        return prev
      }

      if (prev.type !== 'thread') {
        return prev
      }
      const updatedThread = threads.find(
        (thread) => thread.id === prev.thread.id
      )
      return updatedThread == null
        ? { type: 'thread_list' }
        : { ...prev, thread: updatedThread }
    })
  }, [threads])

  useEffect(() => {
    setComments(null)
    if (tabMode.type === 'thread') {
      return observeComments(tabMode.thread, setComments)
    }
    return undefined
  }, [tabMode, observeComments])

  const content = useMemo(() => {
    switch (tabMode.type) {
      case 'thread_list': {
        const onClick = (selectedThread: Thread) =>
          setTabMode({ type: 'thread', thread: selectedThread })
        return threads != null ? (
          <div>
            {threads.map((thread) => (
              <div key={thread.id} className='thread__list__item'>
                <ThreadList
                  thread={thread}
                  onSelect={onClick}
                  onOpen={threadActions.reopen}
                  onClose={threadActions.close}
                  onDelete={threadActions.delete}
                />
              </div>
            ))}
            <div
              className='thread__create'
              onClick={() => setTabMode({ type: 'new' })}
            >
              <Icon path={mdiPlusBoxOutline} /> <span>Create a new thread</span>
            </div>
          </div>
        ) : (
          <Spinner />
        )
      }
      case 'thread': {
        return comments != null ? (
          <div className='thread__content'>
            <div>
              <div className='thread__context'>{tabMode.thread.context}</div>
              <CommentList comments={comments} className='comment__list' />
              {tabMode.thread.status.type === 'open' && (
                <CommentInput
                  onSubmit={(message) => {
                    createComment(tabMode.thread, message)
                  }}
                />
              )}
              {tabMode.thread.status.type === 'closed' && (
                <Button
                  onClick={() => threadActions.reopen(tabMode.thread)}
                  variant='secondary'
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Spinner />
        )
      }
      case 'new': {
        return (
          <div className='thread__new'>
            <div className='thread__context'>{tabMode.context}</div>
            <CommentInput
              onSubmit={async (comment) => {
                await threadActions.create({ ...tabMode, doc: docId, comment })
                setTabMode({ type: 'thread_list' })
              }}
            />
          </div>
        )
      }
    }
  }, [tabMode, threads, createComment, comments, threadActions, docId])

  return (
    <Container>
      <div className='header'>
        {tabMode.type !== 'thread_list' && (
          <div onClick={() => setTabMode({ type: 'thread_list' })}>
            <Icon size={20} path={mdiArrowLeftBoldBoxOutline} />
          </div>
        )}
        <h4>Thread</h4>
        {tabMode.type === 'thread' && (
          <ThreadActionButton
            thread={tabMode.thread}
            onClose={threadActions.close}
            onOpen={threadActions.reopen}
            onDelete={threadActions.delete}
          />
        )}
      </div>
      {content}
    </Container>
  )
}

const Container = styled.div`
  z-index: ${zIndexModalsBackground + 1};
  margin: auto;
  width: ${docContextWidth}px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 0px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }

  .header {
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    & h4 {
      margin: 0;
    }
    display: flex;
    align-items: center;
    height: 44px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
    flex-shrink: 0;
    flex-grow: 0;

    h4 {
      flex-grow: 1;
      &:not(:first-child) {
        margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
      }
    }
  }

  .thread__content {
    max-height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    scrollbar-width: thin;
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    & .comment__list {
      & > div {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
      }
    }
  }

  .thread__context {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    white-space: pre-wrap;
    color: white;
    background-color: #705400;
  }

  .thread__list__item {
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
  }

  .thread__create {
    display: flex;
    align-items: center;
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    cursor: default;
    color: ${({ theme }) => theme.colors.text.secondary};
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
    & > * {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .thread__new {
    padding: 0px ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default CommentManager

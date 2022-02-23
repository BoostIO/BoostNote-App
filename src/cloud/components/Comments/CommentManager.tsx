import React, { useCallback, useMemo } from 'react'
import { Thread, Comment } from '../../interfaces/db/comments'
import Spinner from '../../../design/components/atoms/Spinner'
import { mdiArrowLeft } from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'
import CommentList from './CommentList'
import styled from '../../../design/lib/styled'
import CommentInput from './CommentInput'
import { CreateThreadRequestBody } from '../../api/comments/thread'
import { SerializedUser } from '../../interfaces/db/user'
import ThreadList from './ThreadList'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import Button from '../../../design/components/atoms/Button'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'

export type State =
  | { mode: 'list_loading'; thread?: { id: string } }
  | { mode: 'list'; threads: Thread[]; filter?: (thread: Thread) => boolean }
  | { mode: 'thread_loading'; thread: Thread; threads: Thread[] }
  | { mode: 'thread'; thread: Thread; comments: Comment[]; threads: Thread[] }
  | {
      mode: 'new_thread'
      data: { context?: Thread['context']; selection?: Thread['selection'] }
      threads: Thread[]
    }

export type ModeTransition =
  | { mode: 'thread'; thread: { id: string } }
  | { mode: 'list'; filter?: (thread: Thread) => boolean }
  | {
      mode: 'new_thread'
      context?: Thread['context']
      selection?: Thread['selection']
    }

export interface Actions {
  setMode: (transition: ModeTransition) => void
  createThread: (
    data: Omit<CreateThreadRequestBody, 'doc'>
  ) => Promise<Thread | Error>
  deleteThread: (thread: Thread) => Promise<void | Error>
  threadOutdated: (thread: Thread) => Promise<Thread | Error>
  createComment: (thread: Thread, message: string) => Promise<void | Error>
  updateComment: (comment: Comment, message: string) => Promise<void | Error>
  deleteComment: (comment: Comment) => Promise<void | Error>
}

interface CommentManagerProps extends Actions {
  state: State
  user?: SerializedUser
  users?: SerializedUser[]
}

function CommentManager({
  state,
  setMode,
  createThread,
  deleteThread,
  createComment,
  updateComment,
  deleteComment,
  user,
  users,
}: CommentManagerProps) {
  const { translate } = useI18n()
  const { messageBox } = useDialog()
  const usersOrEmpty = useMemo(() => {
    return users != null ? users : []
  }, [users])

  const deleteCommentWithPrompt = useCallback(
    (comment: Comment) => {
      messageBox({
        title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
          label: 'Comment',
        }),
        message: translate(lngKeys.ModalsDeleteCommentDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteComment(comment)
            },
          },
        ],
      })
    },
    [deleteComment, messageBox, translate]
  )

  const deleteThreadWithPrompt = useCallback(
    (thread: Thread) => {
      messageBox({
        title: translate(lngKeys.ModalsDeleteDocFolderTitle, {
          label: 'Thread',
        }),
        message: translate(lngKeys.ModalsDeleteThreadDisclaimer),
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralDelete),
            onClick: async () => {
              await deleteThread(thread)
            },
          },
        ],
      })
    },
    [deleteThread, messageBox, translate]
  )

  const content = useMemo(() => {
    switch (state.mode) {
      case 'list_loading':
      case 'thread_loading':
        return (
          <div className='thread__loading'>
            <Spinner />
          </div>
        )
      case 'list': {
        return (
          <>
            <div className={'thread__list__container'}>
              <ThreadList
                threads={state.threads}
                onSelect={(thread) => setMode({ mode: 'thread', thread })}
                onDelete={(thread) => deleteThreadWithPrompt(thread)}
                users={usersOrEmpty}
                updateComment={updateComment}
              />
              <CommentInput
                placeholder={'Comment...'}
                onSubmit={async (comment) => {
                  await createThread({ comment })
                }}
                autoFocus={true}
                users={usersOrEmpty}
              />
            </div>
          </>
        )
      }
      case 'thread': {
        return (
          <div className='thread__content'>
            <div>
              <Button
                onClick={() => setMode({ mode: 'list' })}
                variant={'secondary'}
                className={'thread__content__back_button'}
              >
                <div className='icon__wrapper'>
                  <Icon size={16} path={mdiArrowLeft} />
                </div>
                <span>Back</span>
              </Button>

              <div className='thread__context'>{state.thread.context}</div>
              <CommentList
                comments={state.comments}
                className='comment__list'
                updateComment={updateComment}
                deleteComment={(comment) => deleteCommentWithPrompt(comment)}
                user={user}
                users={usersOrEmpty}
              />
              <CommentInput
                placeholder={'Reply...'}
                onSubmit={(message) => createComment(state.thread, message)}
                autoFocus={true}
                users={usersOrEmpty}
              />
            </div>
          </div>
        )
      }
      case 'new_thread': {
        return (
          <div className='thread__new'>
            <CommentInput
              placeholder={'Comment...'}
              onSubmit={async (comment) => {
                await createThread({ ...state.data, comment })
              }}
              autoFocus={true}
              users={usersOrEmpty}
            />
          </div>
        )
      }
    }
  }, [
    state,
    createThread,
    createComment,
    updateComment,
    deleteCommentWithPrompt,
    deleteThreadWithPrompt,
    setMode,
    user,
    usersOrEmpty,
  ])

  return (
    <Container>
      <div className='header'>
        <h4>{translate(lngKeys.ThreadsTitle)}</h4>
      </div>
      {content}
    </Container>
  )
}

const Container = styled.div`
  margin: auto;
  height: 100vh;
  overflow: hidden;
  width: 480px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }

  .header {
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
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

    .icon__wrapper {
      height: 20px;
    }
  }

  .thread__content {
    max-height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    scrollbar-width: thin;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;

    .thread__content__back_button {
      margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    }

    & .comment__list {
      & > div {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
      }

      &:hover {
        .comment__meta__menu {
          display: block;
        }
      }
    }
  }

  .thread__context {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    white-space: pre-wrap;
    color: white;
    background-color: #705400;
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

  .thread__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .thread__list__container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow-y: auto;
    padding 0 ${({ theme }) => theme.sizes.spaces.df}px;;
  }
`

export default CommentManager

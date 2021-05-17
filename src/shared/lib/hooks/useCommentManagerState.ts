import { useComments } from '../stores/comments'
import { Thread, Comment } from '../../../cloud/interfaces/db/comments'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  State,
  Actions,
  ModeTransition,
} from '../../../cloud/components/organisms/CommentManager'

function useCommentManagerState(docId: string): [State, Actions] {
  const {
    observeDocThreads,
    observeComments,
    threadActions,
    commentActions,
  } = useComments()
  const [state, setState] = useState<State>({ mode: 'list_loading' })

  useEffect(() => {
    setState({ mode: 'list_loading' })
    return observeDocThreads(docId, (threads) =>
      setState(updateThreads(threads))
    )
  }, [docId, observeDocThreads])

  const unobserveRef = useRef<() => void>()
  const observingId = useRef<string>()
  useEffect(() => {
    if (state.mode !== 'thread_loading' && state.mode !== 'thread') {
      unobserveRef.current && unobserveRef.current()
      return
    }

    if (
      observingId.current != null &&
      observingId.current !== state.thread.id
    ) {
      unobserveRef.current && unobserveRef.current()
    }

    if (state.mode === 'thread_loading') {
      unobserveRef.current = observeComments(state.thread, (comments) => {
        setState(updateComments(comments))
      })
      observingId.current = state.thread.id
    }
  }, [state, observeComments])

  const setMode: Actions['setMode'] = useCallback((transition) => {
    setState(transitionState(transition))
  }, [])

  const createThread: Actions['createThread'] = useCallback(
    (data) => {
      return threadActions.create({ doc: docId, ...data })
    },
    [threadActions, docId]
  )

  const actions: Actions = useMemo(() => {
    return {
      setMode,
      createThread,
      reopenThread: threadActions.reopen,
      closeThread: threadActions.close,
      deleteThread: threadActions.delete,
      createComment: commentActions.create,
      updateComment: commentActions.updateMessage,
      deleteComment: commentActions.delete,
    }
  }, [setMode, commentActions, threadActions, createThread])

  return [state, actions]
}

function updateThreads(threads: Thread[]) {
  return (oldState: State): State => {
    switch (oldState.mode) {
      case 'list_loading': {
        return { mode: 'list', threads }
      }
      case 'list': {
        return { mode: 'list', threads }
      }
      case 'thread_loading': {
        const updated = threads.find(
          (thread) => thread.id === oldState.thread.id
        )
        return updated != null
          ? { mode: 'thread_loading', thread: updated, threads }
          : { mode: 'list', threads }
      }
      case 'thread': {
        const updated = threads.find(
          (thread) => thread.id === oldState.thread.id
        )
        return updated != null
          ? { ...oldState, thread: updated }
          : { mode: 'list', threads }
      }
      case 'new_thread': {
        return { ...oldState, threads }
      }
    }
  }
}

function updateComments(comments: Comment[]) {
  return (oldState: State): State => {
    switch (oldState.mode) {
      case 'thread':
      case 'thread_loading': {
        return { ...oldState, mode: 'thread', comments }
      }
      default:
        return oldState
    }
  }
}

function transitionState(transition: ModeTransition) {
  return (state: State): State => {
    if (state.mode === 'list_loading') {
      return state
    }

    switch (transition.mode) {
      case 'list':
        return { mode: 'list', threads: state.threads }
      case 'thread': {
        const thread = state.threads.find(
          (thread) => thread.id === transition.thread.id
        )
        return thread != null
          ? { mode: 'thread_loading', thread, threads: state.threads }
          : { mode: 'list', threads: state.threads }
      }
      case 'new_thread':
        return { mode: 'new_thread', data: transition, threads: state.threads }
    }
  }
}

export default useCommentManagerState

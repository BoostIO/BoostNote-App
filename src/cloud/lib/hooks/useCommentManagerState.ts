import { useComments } from '../stores/comments'
import { Thread, Comment } from '../../interfaces/db/comments'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  State,
  Actions,
  ModeTransition,
} from '../../components/Comments/CommentManager'

function useCommentManagerState(docId: string): [State, Actions] {
  const { observeDocThreads, observeComments, threadActions, commentActions } =
    useComments()
  const [state, setState] = useState<State>({ mode: 'list_loading' })

  useEffect(() => {
    setState({ mode: 'list_loading' })
    return observeDocThreads(docId, (threads) => {
      setState(updateThreads(threads))
    })
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
    async (data) => {
      const thread = await threadActions.create({ doc: docId, ...data })
      if (!(thread instanceof Error)) {
        setMode({ mode: 'list' })
      }
      return thread
    },
    [threadActions, docId, setMode]
  )

  const actions: Actions = useMemo(() => {
    return {
      setMode,
      createThread,
      deleteThread: threadActions.delete,
      threadOutdated: threadActions.outdated,
      createComment: commentActions.create,
      updateComment: commentActions.updateMessage,
      deleteComment: commentActions.delete,
      addReaction: commentActions.addReaction,
      removeReaction: commentActions.removeReaction,
    }
  }, [setMode, commentActions, threadActions, createThread])

  return [state, actions]
}

function updateThreads(threads: Thread[]) {
  return (oldState: State): State => {
    switch (oldState.mode) {
      case 'list': {
        return { mode: 'list', threads }
      }
      case 'list_loading': {
        if (oldState.thread == null) {
          return { mode: 'list', threads }
        }
        const threadId = oldState.thread.id
        const updated = threads.find((thread) => thread.id === threadId)
        return updated != null
          ? { mode: 'thread_loading', thread: updated, threads }
          : { mode: 'list', threads }
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
          ? { ...oldState, thread: updated, threads }
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
      if (transition.mode === 'thread') {
        return { ...state, thread: transition.thread }
      }
      return state
    }

    switch (transition.mode) {
      case 'list':
        return {
          mode: 'list',
          threads: state.threads,
          filter: transition.filter,
        }
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

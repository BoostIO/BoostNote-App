import { useComments } from '../stores/comments'
import { Thread, Comment } from '../../../cloud/interfaces/db/comments'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  State,
  Actions,
  ModeTransition,
} from '../../../cloud/components/organisms/CommentManager'
import { useRouter } from '../../../cloud/lib/router'
import { parse as parseQuery } from 'querystring'

function useCommentManagerState(
  docId: string,
  initialThread?: string
): [State, Actions] {
  const location = useRouter()
  const {
    observeDocThreads,
    observeComments,
    threadActions,
    commentActions,
  } = useComments()
  const [state, setState] = useState<State>({ mode: 'list_loading' })
  const initialThreadRef = useRef(initialThread)

  useEffect(() => {
    initialThreadRef.current = initialThread
  }, [initialThread])

  useEffect(() => {
    setState((prev) => {
      if (prev.mode === 'list_loading') {
        return prev
      }

      const { thread: threadId } = parseQuery(location.search.slice(1))
      if (threadId == null) {
        return prev
      }

      const thread = prev.threads.find((thread) => thread.id === threadId)
      if (thread == null) {
        return prev
      }

      return transitionState({ mode: 'thread', thread })(prev)
    })
  }, [location])

  useEffect(() => {
    setState({ mode: 'list_loading' })
    return observeDocThreads(docId, (threads) => {
      setState(updateThreads(threads))
      if (initialThreadRef.current !== '') {
        setState(
          transitionState({
            mode: 'thread',
            thread: { id: initialThreadRef.current } as Thread,
          })
        )
        initialThreadRef.current = ''
      }
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
        setMode({ mode: 'thread', thread })
      }
      return thread
    },
    [threadActions, docId, setMode]
  )

  const actions: Actions = useMemo(() => {
    return {
      setMode,
      createThread,
      reopenThread: threadActions.reopen,
      closeThread: threadActions.close,
      deleteThread: threadActions.delete,
      threadOutdated: threadActions.outdated,
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

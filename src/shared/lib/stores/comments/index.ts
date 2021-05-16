import { createStoreContext } from '../../utils/context'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Thread, Comment } from '../../../../cloud/interfaces/db/comments'
import {
  getThreads,
  createThread,
  CreateThreadRequestBody,
  setThreadStatus,
  deleteThread,
} from '../../../../cloud/api/comments/thread'
import { useToast } from '../toast'
import {
  listThreadComments,
  createComment,
  updateCommentMessage,
  deleteComment,
} from '../../../../cloud/api/comments/comment'
import groupBy from 'ramda/es/groupBy'
import prop from 'ramda/es/prop'

type DocThreadsObserver = (threads: Thread[]) => void
type ThreadObserver = (comments: Comment[]) => void

function useCommentsStore() {
  const { pushApiErrorMessage } = useToast()
  const threadsCache = useRef<Map<string, Thread[]>>(new Map())
  const commentsCache = useRef<Map<string, Comment[]>>(new Map())
  const docThreadsObservers = useRef<Map<string, DocThreadsObserver[]>>(
    new Map()
  )
  const threadObservers = useRef<Map<string, ThreadObserver[]>>(new Map())
  const pushErrorRef = useRef(pushApiErrorMessage)
  const handleError = useRef((promise: Promise<any>) =>
    promise.catch((err) => {
      pushErrorRef.current(err)
    })
  )

  useEffect(() => {
    pushErrorRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  const insertThreadsRef = useRef((threads: Thread[]) => {
    const partioned = groupBy(prop('doc'), threads)
    const docIds = Object.keys(partioned)
    for (const docId of docIds) {
      const existing = threadsCache.current.get(docId) || []
      const merged = mergeOnId(existing, partioned[docId])
      threadsCache.current.set(docId, merged)
      const observers = docThreadsObservers.current.get(docId) || []
      for (const observer of observers) {
        observer(merged)
      }
    }
  })

  const insertCommentsRef = useRef((comments: Comment[]) => {
    const partioned = groupBy(prop('thread'), comments)
    const threadIds = Object.keys(partioned)
    for (const threadId of threadIds) {
      const existing = commentsCache.current.get(threadId) || []
      const merged = mergeOnId(existing, partioned[threadId])
      commentsCache.current.set(threadId, merged)
      const observers = threadObservers.current.get(threadId) || []
      for (const observer of observers) {
        observer(merged)
      }
    }
  })

  const removeThreadRef = useRef((thread: Thread) => {
    const currentThreads = threadsCache.current.get(thread.doc) || []
    const filteredThreads = currentThreads.filter((thr) => thr.id !== thread.id)
    threadsCache.current.set(thread.doc, filteredThreads)
    const observers = docThreadsObservers.current.get(thread.doc) || []
    for (const observer of observers) {
      observer(filteredThreads)
    }
  })

  const removeCommentRef = useRef((comment: Comment) => {
    const currentComments = commentsCache.current.get(comment.thread) || []
    const filteredComments = currentComments.filter(
      (cmt) => cmt.id !== comment.id
    )
    commentsCache.current.set(comment.thread, filteredComments)
    const observers = threadObservers.current.get(comment.thread) || []
    for (const observer of observers) {
      observer(filteredComments)
    }
  })

  const observeDocThreads = useCallback(
    (docId: string, observer: DocThreadsObserver) => {
      defer(() => {
        const loaded = threadsCache.current.get(docId)
        if (loaded != null) {
          observer(loaded)
        }
      })
      const unobserve = registerObservable(
        docId,
        observer,
        docThreadsObservers.current
      )

      if (!threadsCache.current.has(docId)) {
        handleError.current(getThreads(docId).then(insertThreadsRef.current))
      }

      return unobserve
    },
    []
  )

  const observeComments = useCallback(
    (thread: Thread, observer: ThreadObserver) => {
      defer(() => {
        const loaded = commentsCache.current.get(thread.id)
        if (loaded != null) {
          observer(loaded)
        }
      })
      const unobserve = registerObservable(
        thread.id,
        observer,
        threadObservers.current
      )

      if (!commentsCache.current.has(thread.id)) {
        handleError.current(
          listThreadComments(thread).then(insertCommentsRef.current)
        )
      }

      return unobserve
    },
    []
  )

  const [threadActions] = useState(() => {
    const setStatus = (thread: Thread, status: 'closed' | 'open') =>
      handleError.current(
        setThreadStatus(thread, status).then((comment) =>
          insertThreadsRef.current([comment])
        )
      )
    return {
      create: (body: CreateThreadRequestBody) =>
        handleError.current(
          createThread(body).then((thread) =>
            insertThreadsRef.current([thread])
          )
        ),
      reopen: (thread: Thread) => setStatus(thread, 'open'),
      close: (thread: Thread) => setStatus(thread, 'closed'),
      delete: async (thread: Thread) => {
        await handleError.current(deleteThread(thread))
        removeThreadRef.current(thread)
      },
    }
  })

  const [commentActions] = useState(() => {
    return {
      create: (thread: { id: string }, message: string) =>
        handleError.current(
          createComment(thread, message).then((comment) =>
            insertCommentsRef.current([comment])
          )
        ),
      updateMessage: (comment: Comment, message: string) =>
        handleError.current(
          updateCommentMessage(comment, message).then((comment) =>
            insertCommentsRef.current([comment])
          )
        ),
      delete: async (comment: Comment) => {
        await handleError.current(deleteComment(comment))
        removeCommentRef.current(comment)
      },
    }
  })

  return { observeDocThreads, observeComments, threadActions, commentActions }
}

function registerObservable<K, T>(key: K, observer: T, map: Map<K, T[]>) {
  const registered = map.get(key) || []
  registered.push(observer)
  map.set(key, registered)
  return () => {
    const registered = map.get(key) || []
    map.set(
      key,
      registered.filter((obs) => obs !== observer)
    )
  }
}

function defer(fn: () => any) {
  Promise.resolve().then(fn)
}

function mergeOnId<T extends { id: string }>(arr1: T[], arr2: T[]): T[] {
  const arr2Map = new Map(arr2.map((item) => [item.id, item]))
  const replaced = arr1.map((item) => {
    const newItem = arr2Map.get(item.id)
    if (newItem != null) {
      arr2Map.delete(item.id)
      return newItem
    }
    return item
  })
  replaced.push(...arr2Map.values())
  return replaced
}

export const {
  StoreProvider: CommentsProvider,
  useStore: useComments,
} = createStoreContext(useCommentsStore, 'comments')

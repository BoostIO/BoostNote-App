import { createStoreContext } from '../../../../design/lib/utils/context'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Thread, Comment } from '../../../interfaces/db/comments'
import {
  getThreads,
  createThread,
  CreateThreadRequestBody,
  setThreadStatus,
  deleteThread,
  getThread,
} from '../../../api/comments/thread'
import { useToast } from '../../../../design/lib/stores/toast'
import {
  listThreadComments,
  createComment,
  updateCommentMessage,
  deleteComment,
  getComment,
  addReaction,
  removeReactionFromComment,
} from '../../../api/comments/comment'
import groupBy from 'ramda/es/groupBy'
import prop from 'ramda/es/prop'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'
import { mergeOnId } from '../../../../design/lib/utils/array'

type DocThreadsObserver = (threads: Thread[]) => void
type ThreadObserver = (comments: Comment[]) => void

function useCommentsStore() {
  const { pushApiErrorMessage } = useToast()
  const threadsCache = useRef<Map<string, Thread>>(new Map())
  const docThreadsCache = useRef<Map<string, Thread[]>>(new Map())
  const commentsCache = useRef<Map<string, Comment[]>>(new Map())
  const docThreadsObservers = useRef<Map<string, DocThreadsObserver[]>>(
    new Map()
  )
  const threadObservers = useRef<Map<string, ThreadObserver[]>>(new Map())
  const pushErrorRef = useRef(pushApiErrorMessage)
  const handleError = useRef(
    <T>(promise: Promise<T>): Promise<T | Error> =>
      promise.catch((err) => {
        pushErrorRef.current(err)
        return err
      })
  )

  useEffect(() => {
    pushErrorRef.current = pushApiErrorMessage
  }, [pushApiErrorMessage])

  const insertThreadsRef = useRef((threads: Thread[]) => {
    for (const thread of threads) {
      threadsCache.current.set(thread.id, thread)
    }

    const partioned = groupBy(prop('doc'), threads)
    const docIds = Object.keys(partioned)
    for (const docId of docIds) {
      const existing = docThreadsCache.current.get(docId) || []
      const merged = mergeOnId(existing, partioned[docId])
      docThreadsCache.current.set(docId, merged)
      const observers = docThreadsObservers.current.get(docId) || []
      for (const observer of observers) {
        observer(merged)
      }
    }
  })

  const onCommentCreatedRef = useRef((comment: Comment) => {
    const thread = threadsCache.current.get(comment.thread)
    if (thread != null) {
      insertThreadsRef.current([
        {
          ...thread,
          commentCount: thread.commentCount + 1,
          contributors: [comment.user, ...thread.contributors],
          lastCommentTime: comment.createdAt,
        },
      ])
    }
    if (commentsCache.current.has(comment.thread)) {
      insertCommentsRef.current([comment])
    }
  })

  const onCommentUpdatedRef = useRef((comment: Comment) => {
    const thread = threadsCache.current.get(comment.thread)
    if (thread != null) {
      insertThreadsRef.current([
        {
          ...thread,
          lastCommentTime: comment.createdAt,
          initialComment:
            thread.initialComment != null &&
            comment.id === thread.initialComment.id
              ? comment
              : thread.initialComment,
        },
      ])
    }
    if (commentsCache.current.has(comment.thread)) {
      insertCommentsRef.current([comment])
    }
  })

  const onCommentDeletedRef = useRef(
    (comment: { id: string; thread: string }) => {
      const thread = threadsCache.current.get(comment.thread)
      if (thread != null) {
        insertThreadsRef.current([
          {
            ...thread,
            commentCount: thread.commentCount - 1,
            initialComment:
              thread.initialComment != null &&
              comment.id === thread.initialComment.id
                ? undefined
                : thread.initialComment,
          },
        ])
      }

      removeCommentRef.current(comment)
    }
  )

  const insertCommentsRef = useRef((newComments: Comment[]) => {
    const threadIdNewCommentsObjectMap = groupBy(prop('thread'), newComments)
    const threadIds = Object.keys(threadIdNewCommentsObjectMap)
    for (const threadId of threadIds) {
      const existingCommentsOfThread = commentsCache.current.get(threadId) || []
      const newCommentsOfThread = threadIdNewCommentsObjectMap[threadId]
      const mergedCommentsOfThread = mergeOnId(
        existingCommentsOfThread,
        newCommentsOfThread
      )
      commentsCache.current.set(threadId, mergedCommentsOfThread)
      const observers = threadObservers.current.get(threadId) || []
      for (const observer of observers) {
        observer(mergedCommentsOfThread)
      }
    }
  })

  const removeThreadRef = useRef((thread: { id: string; doc: string }) => {
    threadsCache.current.delete(thread.id)
    const currentThreads = docThreadsCache.current.get(thread.doc) || []
    const filteredThreads = currentThreads.filter((thr) => thr.id !== thread.id)
    docThreadsCache.current.set(thread.doc, filteredThreads)
    const observers = docThreadsObservers.current.get(thread.doc) || []
    for (const observer of observers) {
      observer(filteredThreads)
    }
  })

  const removeCommentRef = useRef((comment: { id: string; thread: string }) => {
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
        const loaded = docThreadsCache.current.get(docId)
        if (loaded != null) {
          observer(loaded)
        }
      })
      const unobserve = registerObservable(
        docId,
        observer,
        docThreadsObservers.current
      )

      if (!docThreadsCache.current.has(docId)) {
        handleError.current(
          getThreads(docId).then((threads) => {
            if (threads.length === 0) {
              docThreadsCache.current.set(docId, [])
              const observers = docThreadsObservers.current.get(docId) || []
              for (const observer of observers) {
                observer([])
              }
            } else {
              insertThreadsRef.current(threads)
            }
          })
        )
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
          listThreadComments(thread).then((comments) => {
            if (comments.length === 0) {
              commentsCache.current.set(thread.id, [])
              const observers = threadObservers.current.get(thread.id) || []
              for (const observer of observers) {
                observer([])
              }
            }
            insertCommentsRef.current(comments)
          })
        )
      }

      return unobserve
    },
    []
  )

  const [threadActions] = useState(() => {
    const setStatus = (thread: Thread, status: Thread['status']['type']) =>
      handleError.current(
        setThreadStatus(thread, status).then((thread) => {
          insertThreadsRef.current([thread])
          return thread
        })
      )
    return {
      create: (body: CreateThreadRequestBody) =>
        handleError.current(
          createThread(body).then((thread) => {
            insertThreadsRef.current([thread])
            return thread
          })
        ),
      reopen: (thread: Thread) => setStatus(thread, 'open'),
      close: (thread: Thread) => setStatus(thread, 'closed'),
      outdated: (thread: Thread) => setStatus(thread, 'outdated'),
      delete: async (thread: Thread) => {
        const result = await handleError.current(deleteThread(thread))
        if (!(result instanceof Error)) {
          removeThreadRef.current(thread)
        }
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
      addReaction: async (comment: Comment, reaction: string) => {
        handleError.current(
          addReaction({ id: comment.id, reaction }).then((comment) =>
            insertCommentsRef.current([comment])
          )
        )
      },
      removeReaction: async (comment: Comment, reactionId: string) => {
        handleError.current(
          removeReactionFromComment({
            commentId: comment.id,
            reactionId,
          }).then((comment) => insertCommentsRef.current([comment]))
        )
      },
    }
  })

  const commentsEventListener = useCallback(
    async (event: SerializedAppEvent) => {
      switch (event.type) {
        case 'commentThreadCreated':
        case 'commentThreadUpdated': {
          try {
            if (docThreadsCache.current.has(event.data.docId)) {
              const thread = await getThread(event.data.threadId)
              insertThreadsRef.current([thread])
            }
          } catch {}
          break
        }
        case 'commentThreadDeleted': {
          removeThreadRef.current({
            id: event.data.threadId,
            doc: event.data.docId,
          })
          break
        }
        case 'commentCreated':
        case 'commentUpdated': {
          try {
            const comment = await getComment(event.data.commentId)
            if (event.type === 'commentCreated') {
              onCommentCreatedRef.current(comment)
            } else {
              onCommentUpdatedRef.current(comment)
            }
          } catch {}
          break
        }
        case 'commentDeleted': {
          onCommentDeletedRef.current({
            id: event.data.commentId,
            thread: event.data.threadId,
          })
          break
        }
      }
    },
    []
  )

  return {
    observeDocThreads,
    observeComments,
    threadActions,
    commentActions,
    commentsEventListener,
  }
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

export const { StoreProvider: CommentsProvider, useStore: useComments } =
  createStoreContext(useCommentsStore, 'comments')

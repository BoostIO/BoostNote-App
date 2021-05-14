import { useComments } from '.'
import { useState, useEffect } from 'react'
import { Thread, Comment } from '../../../../cloud/interfaces/db/comments'

export function useDocThreads(docId: string) {
  const { observeDocThreads } = useComments()
  const [threads, setThreads] = useState<Thread[] | null>(null)

  useEffect(() => {
    return observeDocThreads(docId, setThreads)
  }, [observeDocThreads, docId])

  return threads
}

export function useThreadComments(thread: Thread) {
  const { observeThread } = useComments()
  const [comments, setComments] = useState<Comment[] | null>(null)

  useEffect(() => {
    return observeThread(thread, setComments)
  }, [observeThread, thread])

  return comments
}

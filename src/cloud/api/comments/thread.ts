import { callApi } from '../../lib/client'
import { Thread } from '../../interfaces/db/comments'

type SerializedThread = Thread & {
  status: { at: string }
  recentCommentTime: string
}

interface GetDocThreadsResponseBody {
  threads: SerializedThread[]
}

export async function getThreads(doc: string): Promise<Thread[]> {
  const { threads } = await callApi<GetDocThreadsResponseBody>(
    `api/commentThreads`,
    {
      search: { doc },
    }
  )
  return threads.map(deserialize)
}

export interface CreateThreadRequestBody {
  doc: string
  comment?: string
  selection: Thread['selection']
  context?: string
}

interface CreateThreadResponseBody {
  thread: SerializedThread
}

export async function createThread(
  body: CreateThreadRequestBody
): Promise<Thread> {
  const { thread } = await callApi<CreateThreadResponseBody>(
    `api/commentThreads`,
    { method: 'post', json: body }
  )

  return deserialize(thread)
}

interface UpdateThreadResponseBody {
  thread: SerializedThread
}

export async function setThreadStatus(
  { id }: { id: string },
  status: Thread['status']['type']
): Promise<Thread> {
  const { thread } = await callApi<UpdateThreadResponseBody>(
    `api/commentThreads/${id}`,
    { method: 'patch', json: { status: { type: status } } }
  )
  return deserialize(thread)
}

export async function deleteThread(thread: { id: string }) {
  return callApi(`api/commentThreads/${thread.id}`, { method: 'delete' })
}

function deserialize(serialized: SerializedThread): Thread {
  return {
    ...serialized,
    status: { ...serialized.status, at: new Date(serialized.status.at) },
    lastCommentTime: new Date(serialized.lastCommentTime),
  }
}

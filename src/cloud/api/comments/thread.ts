import { callApi } from '../../lib/client'
import { Thread } from '../../interfaces/db/comments'
import { decodeRelativePosition, encodeRelativePosition } from 'yjs'

type SerializedThread = Thread & {
  status: { at: string }
  recentCommentTime: string
  selection?: {
    anchor: number[]
    head: number[]
  }
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

interface GetThreadResponseBody {
  thread: SerializedThread
}

export async function getThread(id: string): Promise<Thread> {
  const { thread } = await callApi<GetThreadResponseBody>(
    `api/commentThreads/${id}`
  )
  return deserialize(thread)
}

export interface CreateThreadRequestBody {
  doc: string
  comment?: string
  selection?: Thread['selection']
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
    {
      method: 'post',
      json: {
        doc: body.doc,
        comment: body.comment,
        selection: serializeSelection(body.selection),
        context: body.context,
      },
    }
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

function serializeSelection(
  selection: Thread['selection']
): SerializedThread['selection'] {
  return (selection != null
    ? {
        anchor: Array.from(encodeRelativePosition(selection.anchor)),
        head: Array.from(encodeRelativePosition(selection.head)),
      }
    : undefined) as SerializedThread['selection']
}

function deserialize(serialized: SerializedThread): Thread {
  const selection =
    serialized.selection != null
      ? {
          anchor: decodeRelativePosition(
            Uint8Array.from(serialized.selection.anchor)
          ),
          head: decodeRelativePosition(
            Uint8Array.from(serialized.selection.head)
          ),
        }
      : undefined

  return {
    ...serialized,
    status: { ...serialized.status, at: new Date(serialized.status.at) },
    lastCommentTime: new Date(serialized.lastCommentTime),
    selection,
  }
}

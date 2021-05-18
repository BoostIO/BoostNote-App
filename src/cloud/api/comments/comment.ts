import { Comment } from '../../interfaces/db/comments'
import { callApi } from '../../lib/client'

type SerializedComment = Comment & { createdAt: string; updateAt: string }

interface ListCommentsResponseBody {
  comments: SerializedComment[]
}

export async function listThreadComments(thread: {
  id: string
}): Promise<Comment[]> {
  const { comments } = await callApi<ListCommentsResponseBody>(`api/comments`, {
    search: { thread: thread.id },
  })

  return comments.map(deserialize)
}

interface GetCommentResponseBody {
  comment: SerializedComment
}

export async function getComment(id: string) {
  const { comment } = await callApi<GetCommentResponseBody>(
    `api/comments/${id}`
  )
  return deserialize(comment)
}

interface CreateCommentResponseBody {
  comment: SerializedComment
}

export async function createComment(
  thread: { id: string },
  message: string
): Promise<Comment> {
  const { comment } = await callApi<CreateCommentResponseBody>(`api/comments`, {
    method: 'post',
    json: { message, thread: thread.id },
  })

  return deserialize(comment)
}

interface UpdateCommentResponseBody {
  comment: SerializedComment
}

export async function updateCommentMessage(
  { id }: { id: string },
  message: string
): Promise<Comment> {
  const { comment } = await callApi<UpdateCommentResponseBody>(
    `api/comments/${id}`,
    { method: 'patch', json: { message } }
  )

  return deserialize(comment)
}

export async function deleteComment({ id }: { id: string }) {
  await callApi(`api/comments/${id}`, { method: 'delete' })
}

function deserialize(comment: SerializedComment): Comment {
  return {
    ...comment,
    updatedAt: new Date(comment.updateAt),
    createdAt: new Date(comment.createdAt),
  }
}

import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import report from '../../../lib/analytics'
import { callApi } from '../../../lib/client'

export interface CreateDocBookmarkResponseBody {
  doc: SerializedDocWithBookmark
}

export async function createDocBookmark(teamId: string, docId: string) {
  const data = await callApi<CreateDocBookmarkResponseBody>(
    `api/teams/${teamId}/docs/${docId}/bookmarks`,
    { method: 'post' }
  )
  report('create_bookmark_doc')
  return data
}

export interface DestroyDocBookmarkResponseBody {
  doc: SerializedDocWithBookmark
}

export async function destroyDocBookmark(teamId: string, docId: string) {
  const data = await callApi<DestroyDocBookmarkResponseBody>(
    `api/teams/${teamId}/docs/${docId}/bookmarks`,
    {
      method: 'delete',
    }
  )
  report('delete_bookmark_doc')
  return data
}

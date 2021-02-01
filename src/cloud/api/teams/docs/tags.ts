import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'

export interface DeleteTagFromDocResponseBody {
  doc: SerializedDocWithBookmark
}

export async function deleteTagFromDoc(
  teamId: string,
  docId: string,
  tagId: string
) {
  const response = await callApi(
    `/api/teams/${teamId}/docs/${docId}/tags/${tagId}`,
    { method: 'delete' }
  )
  return response.data as DeleteTagFromDocResponseBody
}

import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'

export interface DeleteTagFromDocResponseBody {
  doc: SerializedDocWithSupplemental
}

export async function deleteTagFromDoc(
  teamId: string,
  docId: string,
  tagId: string
) {
  return callApi<DeleteTagFromDocResponseBody>(
    `api/teams/${teamId}/docs/${docId}/tags/${tagId}`,
    { method: 'delete' }
  )
}

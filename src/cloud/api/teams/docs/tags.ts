import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'

export interface DeleteTagFromDocResponseBody {
  doc: SerializedDocWithSupplemental
}

export async function deleteTagFromDoc(
  _teamId: string,
  docId: string,
  tagId: string
) {
  return callApi<DeleteTagFromDocResponseBody>(
    `api/docs/${docId}/tags/${tagId}`,
    { method: 'delete' }
  )
}

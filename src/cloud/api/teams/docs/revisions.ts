import { SerializedRevision } from '../../../interfaces/db/revision'
import { callApi } from '../../../lib/client'

export interface GetAllDocRevisionsResponseBody {
  revisions: SerializedRevision[]
  page: number
  totalPages: number
}

export async function getAllRevisionsFromDoc(
  _teamId: string,
  docId: string,
  page = 1
) {
  return callApi<GetAllDocRevisionsResponseBody>(
    `api/docs/${docId}/revisions`,
    {
      search: { page },
    }
  )
}

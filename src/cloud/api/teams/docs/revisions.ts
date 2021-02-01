import { SerializedRevision } from '../../../interfaces/db/revision'
import { callApi } from '../../../lib/client'

export interface GetAllDocRevisionsResponseBody {
  revisions: SerializedRevision[]
  page: number
  totalPages: number
}

export async function getAllRevisionsFromDoc(
  teamId: string,
  docId: string,
  page = 1
) {
  const response = await callApi(
    `/api/teams/${teamId}/docs/${docId}/revisions`,
    {
      search: { page },
    }
  )
  return response.data as GetAllDocRevisionsResponseBody
}

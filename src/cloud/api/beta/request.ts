import { SerializedBetaRequest } from '../../interfaces/db/beta'
import { callApi } from '../../lib/client'

interface GetBetaRequestsResponseBody {
  betaRequests: SerializedBetaRequest[]
}

export async function getBetaRequests(teamId: string, category?: string) {
  const query: { [key: string]: string } = { team: teamId }
  if (category != null) {
    query.category = category
  }
  return callApi<GetBetaRequestsResponseBody>(`api/beta/requests`, {
    method: 'get',
    search: query,
  })
}

interface CreateBetaRequestResponseBody {
  betaRequest: SerializedBetaRequest
}

export async function createBetaRequest(
  teamId: string,
  category: string,
  data: Object
) {
  return callApi<CreateBetaRequestResponseBody>(`api/beta/requests`, {
    method: 'post',
    json: { team: teamId, category, data },
  })
}

interface UpdateBetaRequestResponseBody {
  betaRequest: SerializedBetaRequest
}

export async function updateBetaRequest(betaRequestId: string, data: Object) {
  return callApi<UpdateBetaRequestResponseBody>(
    `api/beta/requests/${betaRequestId}`,
    {
      method: 'put',
      json: { data },
    }
  )
}

export async function deleteBetaRequest(betaRequestId: string) {
  return callApi(`api/beta/requests/${betaRequestId}`, {
    method: 'delete',
  })
}

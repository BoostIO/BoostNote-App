import { callApi } from '../../lib/client'
import { SerializedEditRequest } from '../../interfaces/db/editRequest'

export interface GetEditRequestsResponseBody {
  editRequests: SerializedEditRequest[]
}

export async function getUserEditRequests(teamId?: string) {
  return callApi<GetEditRequestsResponseBody>(`api/edit-requests`, {
    method: 'get',
    search: teamId != null ? { teamId } : undefined,
  })
}

export interface SendEditRequestResponseBody {
  editRequest?: SerializedEditRequest
}

export async function sendEditRequest(teamId: string) {
  const result = await callApi<SendEditRequestResponseBody>(
    `api/edit-requests`,
    {
      method: 'post',
      json: { teamId },
    }
  )

  return result
}

export interface DeleteEditRequestResponseBody {
  status: 'ok' | 'err'
  err: unknown
}

export async function deleteEditRequest(requestId: string) {
  const result = await callApi<DeleteEditRequestResponseBody>(
    `api/edit-requests/${requestId}`,
    {
      method: 'delete',
    }
  )

  return result
}

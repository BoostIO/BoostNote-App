import { SerializedStatus } from '../../interfaces/db/status'
import { callApi } from '../../lib/client'

export interface StatusCreateRequestBody {
  team: string
  name: string
  backgroundColor?: string
}

export interface StatusCreateResponseBody {
  data: SerializedStatus
}

export async function createStatus(body: StatusCreateRequestBody) {
  const { data } = await callApi<StatusCreateResponseBody>(`api/status`, {
    method: 'post',
    json: body,
  })
  return data
}

export interface StatusUpdateRequestBody {
  id: string
  name: string
  backgroundColor?: string
}

export interface StatusUpdateResponseBody {
  data: SerializedStatus
}

export async function updateStatus(body: StatusUpdateRequestBody) {
  const { data } = await callApi<StatusUpdateResponseBody>(
    `api/status/${body.id}`,
    {
      method: 'put',
      json: body,
    }
  )
  return data
}

export interface StatusListResponseBody {
  data: SerializedStatus[]
}

export async function listStatuses(
  filters: { team?: string; name?: string } = {}
) {
  const { data } = await callApi<StatusListResponseBody>(`api/status`, {
    search: filters,
  })
  return data
}

export interface StatusGetResponseBody {
  data: SerializedStatus
}

export async function getStatus(id: string) {
  const { data } = await callApi<StatusGetResponseBody>(`api/status/${id}`)
  return data
}

export async function deleteStatus(id: number) {
  await callApi(`/api/status/${id}`, { method: 'delete' })
}

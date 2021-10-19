import { callApi } from '../../../lib/client'
import { SerializedView, SupportedViewTypes } from '../../../interfaces/db/view'

export type CreateViewRequestBody =
  | {
      view: string
      type: SupportedViewTypes
    }
  | { folder: string; type: SupportedViewTypes }

export interface CreateViewResponseBody {
  data: SerializedView
}

export async function createView(body: CreateViewRequestBody) {
  return callApi<CreateViewResponseBody>(`/api/views`, {
    json: body,
    method: 'post',
  })
}

export interface UpdateViewRequestBody {
  data: Object
  before?: string
}

export interface UpdateViewResponseBody {
  data: SerializedView
}

export async function updateView(
  view: SerializedView,
  body: UpdateViewRequestBody
) {
  return callApi<UpdateViewResponseBody>(`/api/views/${view.id}`, {
    json: body,
    method: 'patch',
  })
}

export async function deleteView(id: number | string) {
  return callApi<{}>(`/api/views/${id}`, {
    method: 'delete',
  })
}

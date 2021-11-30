import { callApi } from '../../../lib/client'
import { SerializedView, SupportedViewTypes } from '../../../interfaces/db/view'
import { ViewMoveType } from '../../../lib/views'

export type ListViewsRequestBody =
  | {
      smartView: string
      type?: SupportedViewTypes
    }
  | { folder: string; type?: SupportedViewTypes }
  | { workspace: string; type?: SupportedViewTypes }

export interface ListViewsResponseBody {
  data: SerializedView[]
}

export async function listViews(body: ListViewsRequestBody) {
  return callApi<ListViewsResponseBody>(`/api/views`, {
    search: body,
    method: 'get',
  })
}

export type CreateViewRequestBody = {
  data?: Object
  type: SupportedViewTypes
  smartView?: string
  folder?: string
  workspace?: string
  name: string
}

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
  name?: string
  data?: Object
  move?: ViewMoveType
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

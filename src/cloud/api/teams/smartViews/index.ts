import { callApi } from '../../../lib/client'
import {
  SerializedSmartView,
  SerializedQuery,
} from '../../../interfaces/db/smartView'
import { SupportedViewTypes } from '../../../interfaces/db/view'

export interface CreateSmartViewRequestBody {
  name: string
  condition: SerializedQuery
  teamId: string
  dashboardId: string
  view: SupportedViewTypes
}

export interface CreateSmartViewResponseBody {
  data: SerializedSmartView
}

export async function createSmartView(
  body: CreateSmartViewRequestBody & { teamId: string }
) {
  const data = await callApi<CreateSmartViewResponseBody>(`/api/smart-views`, {
    json: body,
    method: 'post',
  })

  return data
}

export interface UpdateSmartViewRequestBody {
  name: string
  condition: SerializedQuery
  view?: SupportedViewTypes
}

export interface UpdateSmartViewResponseBody {
  data: SerializedSmartView
}

export async function updateSmartView(
  smartView: SerializedSmartView,
  body: UpdateSmartViewRequestBody
) {
  const data = await callApi<CreateSmartViewResponseBody>(
    `/api/smart-views/${smartView.id}`,
    {
      json: body,
      method: 'put',
    }
  )

  return data
}

export interface DeleteSmartViewResponseBody {
  data: SerializedSmartView
}

export async function deleteSmartView(smartView: { id: string }) {
  const data = await callApi<DeleteSmartViewResponseBody>(
    `/api/smart-views/${smartView.id}`,
    {
      method: 'delete',
    }
  )

  return data
}

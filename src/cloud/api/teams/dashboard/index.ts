import { callApi } from '../../../lib/client'
import {
  SerializedDashboard,
  SerializedPrimaryCondition,
} from '../../../interfaces/db/dashboard'

export interface CreateDashboardRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface CreateDashboardResponseBody {
  data: SerializedDashboard
}

export async function createDashboard(
  body: CreateDashboardRequestBody & { teamId: string }
) {
  const data = await callApi<CreateDashboardResponseBody>(`/api/dashboards`, {
    json: body,
    method: 'post',
  })

  return data
}

export interface UpdateDashboardRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface UpdateDashboardResponseBody {
  data: SerializedDashboard
}

export async function updateDashboard(
  dashboard: SerializedDashboard,
  body: CreateDashboardRequestBody
) {
  const data = await callApi<CreateDashboardResponseBody>(
    `/api/dashboards/${dashboard.id}`,
    {
      json: body,
      method: 'put',
    }
  )

  return data
}

export interface DeleteDashboardResponseBody {
  data: SerializedDashboard
}

export async function deleteDashboard(dashboard: { id: string }) {
  const data = await callApi<DeleteDashboardResponseBody>(
    `/api/dashboards/${dashboard.id}`,
    {
      method: 'delete',
    }
  )

  return data
}

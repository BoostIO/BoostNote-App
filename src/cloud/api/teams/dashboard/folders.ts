import { callApi } from '../../../lib/client'
import {
  SerializedDashboardFolder,
  SerializedPrimaryCondition,
} from '../../../interfaces/db/dashboardFolder'

export interface CreateDashboardFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface CreateDashboardFolderResponseBody {
  dashboardFolder: SerializedDashboardFolder
}

export async function createDashboardFolder(
  body: CreateDashboardFolderRequestBody & { teamId: string }
) {
  const data = await callApi<CreateDashboardFolderResponseBody>(
    `/api/dashboard/folders`,
    {
      json: body,
      method: 'post',
    }
  )

  return data
}

export interface UpdateDashboardFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface UpdateDashboardFolderResponseBody {
  dashboardFolder: SerializedDashboardFolder
}

export async function updateDashboardFolder(
  dashboardFolder: SerializedDashboardFolder,
  body: CreateDashboardFolderRequestBody
) {
  const data = await callApi<CreateDashboardFolderResponseBody>(
    `/api/dashboard/folders/${dashboardFolder.id}`,
    {
      json: body,
      method: 'put',
    }
  )

  return data
}

export interface UpdateDashboardFolderRequestBody {
  name: string
  condition: SerializedPrimaryCondition
  private: boolean
}

export interface UpdateDashboardFolderResponseBody {
  dashboardFolder: SerializedDashboardFolder
}

export async function deleteDashboardFolder(dashboardFolder: { id: string }) {
  const data = await callApi<CreateDashboardFolderResponseBody>(
    `/api/dashboard/folders/${dashboardFolder.id}`,
    {
      method: 'delete',
    }
  )

  return data
}

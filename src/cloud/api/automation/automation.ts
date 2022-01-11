import { stringify } from 'querystring'
import { SerializedAutomation } from '../../interfaces/db/automations'
import { callApi } from '../../lib/client'

export interface GetAutomationResponseBody {
  data: SerializedAutomation
}

export async function getAutomation(id: string) {
  const { data } = await callApi<GetAutomationResponseBody>(
    `api/automations/${id}`
  )
  return data
}

export interface ListAutomationsQuery {
  name?: string
  team?: string | string[]
  workflow?: string | string[]
  enabled?: string
  createdBy?: string
}

export interface ListAutomationsResponseBody {
  data: SerializedAutomation[]
}

export async function getAutomations(params: ListAutomationsQuery) {
  const { data } = await callApi<ListAutomationsResponseBody>(
    'api/automations',
    {
      search: stringify(params as any),
    }
  )
  return data
}

export interface CreateAutomationRequestBody {
  name: string
  description?: string
  workflow: string
  team: string
}

export interface CreateAutomationResponseBody {
  data: SerializedAutomation
}

export async function createAutomation(
  automationData: CreateAutomationRequestBody
) {
  const { data } = await callApi<CreateAutomationResponseBody>(
    `api/automations`,
    {
      method: 'post',
      json: automationData,
    }
  )
  return data
}

export interface UpdateAutomationRequestBody {
  name: string
  description?: string
}

export interface UpdateAutomationResponseBody {
  data: SerializedAutomation
}

export async function updateAutomation(
  automationData: CreateAutomationRequestBody
) {
  const { data } = await callApi<CreateAutomationResponseBody>(
    `api/automations`,
    {
      method: 'patch',
      json: automationData,
    }
  )
  return data
}

export async function deleteAutomation(id: string) {
  await callApi(`api/automations/${id}`, { method: 'delete' })
}

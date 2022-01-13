import { stringify } from 'querystring'
import {
  SerializedPipe,
  SerializedWorkflow,
} from '../../interfaces/db/automations'
import { callApi } from '../../lib/client'

export interface GetWorkflowResponseBody {
  data: SerializedWorkflow
}

export async function getWorkflow(id: string) {
  const { data } = await callApi<GetWorkflowResponseBody>(`api/workflows/${id}`)
  return data
}

export interface ListWorkflowsQuery {
  name?: string | string[]
  team?: string | string[]
}

export interface ListWorkflowsResponseBody {
  data: SerializedWorkflow[]
}

export async function getWorkflows(params: ListWorkflowsQuery) {
  const { data } = await callApi<ListWorkflowsResponseBody>('api/workflows', {
    search: stringify(params as any),
  })
  return data
}

export interface CreateWorkflowRequestBody {
  name: string
  description?: string
  pipes: SerializedPipe[]
  team: string
}

export interface CreateWorkflowResponseBody {
  data: SerializedWorkflow
}

export async function createWorkflow(workflowData: CreateWorkflowRequestBody) {
  const { data } = await callApi<CreateWorkflowResponseBody>(`api/workflows`, {
    method: 'post',
    json: workflowData,
  })
  return data
}

export interface UpdateWorkflowRequestBody {
  name: string
  description?: string
  pipes: SerializedPipe[]
  team: string
}

export interface UpdateWorkflowResponseBody {
  data: SerializedWorkflow
}

export async function updateWorkflow(
  id: number,
  workflowData: UpdateWorkflowRequestBody
) {
  const { data } = await callApi<UpdateWorkflowResponseBody>(
    `api/workflows/${id}`,
    {
      method: 'put',
      json: workflowData,
    }
  )
  return data
}

export async function deleteWorkflow(id: number) {
  await callApi(`api/workflows/${id}`, { method: 'delete' })
}

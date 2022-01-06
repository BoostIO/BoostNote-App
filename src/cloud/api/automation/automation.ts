import { SerializedAutomation } from '../../interfaces/db/automations'

export interface GetWorkflowResponseBody {
  data: SerializedAutomation
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

export interface CreateAutomationRequestBody {
  name: string
  description?: string
  workflow: string
  team: string
}

export interface CreateAutomationResponseBody {
  data: SerializedAutomation
}

export interface UpdateAutomationRequestBody {
  name: string
  description?: string
}

export interface UpdateAutomationResponseBody {
  data: SerializedAutomation
}

import {
  SerializedPipe,
  SerializedWorkflow,
} from '../../interfaces/db/automations'

export interface GetWorkflowResponseBody {
  data: SerializedWorkflow
}

export interface ListWorkflowsQuery {
  name?: string | string[]
  team?: string | string[]
}

export interface ListWorkflowsResponseBody {
  data: SerializedWorkflow[]
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

export interface UpdateWorkflowRequestBody {
  name: string
  description?: string
  pipes: SerializedPipe[]
  team: string
}

export interface UpdateWorkflowResponseBody {
  data: SerializedWorkflow
}

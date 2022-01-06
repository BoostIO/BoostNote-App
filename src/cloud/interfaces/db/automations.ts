export interface SerializedPipe {
  name: string
  action: string
  event: string
  filter?: any
  configuration: any
}

export interface SerializedWorkflow {
  id: number
  name: string
  description: string
  pipes: SerializedPipe[]
  teamId?: string
  createdById?: string
  createdAt: string
  updatedAt: string
}

export interface SerializedAutomation {
  id: number
  name: string
  description: string
  workflowId: number
  teamId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

import { PipeEntry } from '../../lib/automations'

export interface SerializedPipe {
  name: string
  event: string
  filter?: any
  configuration: PipeEntry
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
  env: any
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface SerializedAutomationLog {
  type: string
  info: string
  isError: boolean
  createdAt: string
}

import { SerializedWorkspace } from './workspace'
import { SerializedTeam } from './team'

export interface SerializableWorkspacePositionsProps {
  id: string
  orderedIds: string[]
}

export interface SerializedUnserializableWorkspacePositionsProps {
  workspace?: SerializedWorkspace
  team: SerializedTeam | string
  updatedAt: string
}

export type SerializedWorkspacePositions = SerializedUnserializableWorkspacePositionsProps &
  SerializableWorkspacePositionsProps

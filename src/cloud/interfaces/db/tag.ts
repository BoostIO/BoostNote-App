import type { SerializedTeam } from './team'
import type { SerializedDoc } from './doc'

export interface SerializableTagProps {
  id: string
  text: string
  teamId: string
}

export interface SerializedUnserializableTagProps {
  docs?: SerializedDoc[]
  team: SerializedTeam
  createdAt: string
}

export type SerializedTag = SerializedUnserializableTagProps &
  SerializableTagProps

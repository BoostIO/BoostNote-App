import type { Team } from '../../lib/db/entities/Team'
import { SerializedTeam } from './team'
import type { User } from '../../lib/db/entities/User'
import { SerializedUser } from './user'

export interface SerializableTemplateProps {
  id: string
  emoji?: string
  title: string
  content: string
  editorId?: string
  teamId: string
}

export interface UnserializableTemplateProps {
  createdAt: Date
  updatedAt: Date
  editor?: User
  team: Team
}

export interface SerializedUnserializableTemplateProps {
  team: SerializedTeam
  editor: SerializedUser
  createdAt: string
  updatedAt: string
}

export type SerializedTemplate = SerializedUnserializableTemplateProps &
  SerializableTemplateProps

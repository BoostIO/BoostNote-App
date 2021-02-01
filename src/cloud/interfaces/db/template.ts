import { SerializedTeam } from './team'
import { SerializedUser } from './user'

export interface SerializableTemplateProps {
  id: string
  emoji?: string
  title: string
  content: string
  editorId?: string
  teamId: string
}

export interface SerializedUnserializableTemplateProps {
  team: SerializedTeam
  editor: SerializedUser
  createdAt: string
  updatedAt: string
}

export type SerializedTemplate = SerializedUnserializableTemplateProps &
  SerializableTemplateProps

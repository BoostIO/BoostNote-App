import { SerializedTeam } from './team'

export interface SerializableOpenInviteProps {
  id: string
  role: string
  slug: string
  teamId: string
}

export interface SerializedUnserializableOpenInviteProps {
  createdAt: string
  updatedAt: string
  team?: SerializedTeam
}

export type SerializedOpenInvite = SerializedUnserializableOpenInviteProps &
  SerializableOpenInviteProps

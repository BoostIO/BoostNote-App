import { SerializedTeam } from './team'
import { SerializedUser } from './user'
import { SerializedDoc } from './doc'

export interface SerializableGuestProps {
  id: string
  teamId: string
  userId: string
  docsIds: string[]
}

export interface SerializedUnserializableGuestProps {
  createdAt: string
  team: SerializedTeam
  docs: SerializedDoc[]
  user: SerializedUser
}

export type SerializedGuest = SerializedUnserializableGuestProps &
  SerializableGuestProps

export interface SerializableGuestInviteProps {
  id: string
  email: string
  docId: string
  teamId: string
  pending: boolean
}

export interface SerializedUnserializableGuestInviteProps {
  createdAt: string
  inviter: SerializedUser
  canceller?: SerializedUser
  guest?: SerializedGuest
  team: SerializedTeam
  doc: SerializedDoc
}

export type SerializedGuestInvite = SerializedUnserializableGuestInviteProps &
  SerializableGuestInviteProps

import { SerializedTeam } from './team'
import { SerializedDoc } from './doc'
import { SerializedUser } from './user'

export interface SerializedMention {
  id: string
  team: string | SerializedTeam
  doc: string | SerializedDoc
  target: string | SerializedUser
  source: string | SerializedUser
  createdAt: string
  seenAt?: string
}

export interface ExpandedSerializedMention extends SerializedMention {
  doc: SerializedDoc
  target: SerializedUser
  source: SerializedUser
}

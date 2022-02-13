import { SerializedUserTeamPermissions } from './userTeamPermissions'

export interface CommentReaction {
  id: string
  emoji: string
  teamMember: SerializedUserTeamPermissions
  createdAt: string
}

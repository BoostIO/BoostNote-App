import { SerializedTeam } from './db/team'
import { SerializedFolderWithBookmark } from './db/folder'
import { SerializedDocWithSupplemental } from './db/doc'
import { SerializedUserTeamPermissions } from './db/userTeamPermissions'
import { SerializedSubscription } from './db/subscription'
import { SerializedTag } from './db/tag'
import { SerializedWorkspace } from './db/workspace'

export interface GeneralAppProps {
  team: SerializedTeam
  folders: SerializedFolderWithBookmark[]
  docs: SerializedDocWithSupplemental[]
  permissions: SerializedUserTeamPermissions[]
  subscription?: SerializedSubscription
  workspaces: SerializedWorkspace[]
  tags: SerializedTag[]
}

export interface TrgmProperty {
  sml: number
  context?: string
}

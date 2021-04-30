import { SerializedTeam } from './team'
import { SerializedFolder } from './folder'
import { SerializedRevision } from './revision'
import type { SerializedTag } from './tag'
import { SerializedWorkspace } from './workspace'
import { SerializedShareLink } from './shareLink'

export interface SerializableDocProps {
  id: string
  title: string
  emoji?: string
  parentFolderId?: string
  folderPathname: string
  generated: boolean
  version: number
  teamId: string
  workspaceId: string
}

export interface SerializedUnserializableDocProps {
  parentFolder?: SerializedFolder
  team: SerializedTeam
  tags: SerializedTag[]
  createdAt: string
  updatedAt: string
  archivedAt?: string
  head?: SerializedRevision
  workspace?: SerializedWorkspace
  shareLink?: SerializedShareLink
  collaborationToken?: string
}

export type SerializedDoc = SerializedUnserializableDocProps &
  SerializableDocProps

export type SerializedDocWithBookmark = SerializedDoc & {
  bookmarked: boolean
}

import { SerializedTeam } from './team'
import { SerializedFolder } from './folder'
import { SerializedRevision } from './revision'
import type { SerializedTag } from './tag'
import { SerializedWorkspace } from './workspace'
import { SerializedShareLink } from './shareLink'
import { SerializedUser } from './user'
import { ContainerBlock } from '../../api/blocks'

export type DocStatus = 'in_progress' | 'completed' | 'archived' | 'paused'

export interface SerializedDocAssignee {
  id: string
  docId: string
  doc?: SerializedDoc
  userId: string
  user?: SerializedUser
}

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
  status?: DocStatus
  dueDate: string
  assignees?: SerializedDocAssignee[]
  userId?: string
  rootBlock?: ContainerBlock
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
  user?: SerializedUser
}

export type SerializedDoc = SerializedUnserializableDocProps &
  SerializableDocProps

export type SerializedDocWithBookmark = SerializedDoc & {
  bookmarked: boolean
}

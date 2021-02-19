import { SerializedTeam } from './team'
import { SerializedDoc } from './doc'
import { SerializedFolderPositions } from './folderPositions'
import { SerializedWorkspace } from './workspace'

export interface SerializableFolderProps {
  id: string
  emoji?: string
  name: string
  pathname: string
  description: string
  version: number
  teamId: string
  generated: boolean
  parentFolderId?: string
  childDocsIds: string[]
  childFoldersIds: string[]
  workspaceId: string
}

export interface SerializedUnserializableFolderProps {
  workspace?: SerializedWorkspace
  parentFolder?: SerializedFolder | string
  positions: SerializedFolderPositions | string
  childDocs: SerializedDoc[]
  childFolders: SerializedFolder[]
  team: SerializedTeam | string
  createdAt: string
  updatedAt: string
}

export type SerializedFolder = SerializedUnserializableFolderProps &
  SerializableFolderProps

export type SerializedFolderWithBookmark = SerializedFolder & {
  bookmarked: boolean
}

import { SerializedFolder } from './folder'
import { SerializedTeam } from './team'

export interface SerializableFolderPositionsProps {
  id: string
  orderedIds: string[]
}

export interface UnserializableFolderPositionsProps {
  parentFolder?: Folder | string
  team: Team | string
  updatedAt: Date
}

export interface SerializedUnserializableFolderPositionsProps {
  parentFolder?: SerializedFolder | string
  team: SerializedTeam | string
  updatedAt: string
}

export type SerializedFolderPositions = SerializedUnserializableFolderPositionsProps &
  SerializableFolderPositionsProps

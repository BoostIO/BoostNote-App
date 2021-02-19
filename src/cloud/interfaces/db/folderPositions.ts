import { SerializedFolder } from './folder'
import { SerializedTeam } from './team'

export interface SerializableFolderPositionsProps {
  id: string
  orderedIds: string[]
}

export interface SerializedUnserializableFolderPositionsProps {
  parentFolder?: SerializedFolder | string
  team: SerializedTeam | string
  updatedAt: string
}

export type SerializedFolderPositions = SerializedUnserializableFolderPositionsProps &
  SerializableFolderPositionsProps

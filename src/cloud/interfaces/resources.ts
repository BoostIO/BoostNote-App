export const FOLDER_DRAG_TRANSFER_DATA_JSON =
  'application/boostnote.folder+json'
export const DOC_DRAG_TRANSFER_DATA_JSON = 'application/boostnote.doc+json'
export const CATEGORY_DRAG_TRANSFER_DATA_JSON =
  'application/boostnote.category+json'

export interface DocDataTransferItem {
  workspaceId: string
  teamId: string
  id: string
  emoji?: string
  url: string
  title: string
}

export interface FolderDataTransferItem {
  workspaceId: string
  teamId: string
  id: string
  emoji?: string
  url: string
  name: string
  description?: string
}

export type SerializedFolderNav = {
  type: 'folder'
  resource: FolderDataTransferItem
}

export type SerializedDocNav = {
  type: 'doc'
  resource: DocDataTransferItem
}

export type SerializedPendingNav = {
  type: 'folder' | 'doc'
  result: string
}

export type NavResource = SerializedFolderNav | SerializedDocNav
export type PendingNavResource = NavResource | SerializedPendingNav

export type OrderedNavResource = NavResource & { order?: number }
export type OrderedPendingNavResource = PendingNavResource & { order?: number }

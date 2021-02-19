import { SerializedFolderWithBookmark } from './db/folder'
import { SerializedDocWithBookmark } from './db/doc'

export type SerializedFolderNav = {
  type: 'folder'
  result: SerializedFolderWithBookmark
}

export type SerializedDocNav = {
  type: 'doc'
  result: SerializedDocWithBookmark
}

export type SerializedPendingNav = {
  type: 'folder' | 'doc'
  result: string
}

export type NavResource = SerializedFolderNav | SerializedDocNav
export type PendingNavResource = NavResource | SerializedPendingNav

export type OrderedNavResource = NavResource & { order?: number }
export type OrderedPendingNavResource = PendingNavResource & { order?: number }

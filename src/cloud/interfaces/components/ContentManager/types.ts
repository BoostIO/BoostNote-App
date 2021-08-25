import { SerializedDocWithBookmark } from '../../db/doc'
import { SerializedFolderWithBookmark } from '../../db/folder'

export type UnsignedItem =
  | SerializedDocWithBookmark
  | SerializedFolderWithBookmark

export type ContentManagerRowAction<T extends UnsignedItem> = {
  iconPath: string
  tooltip?: string
  id: number
  onClick: (item: T) => void
}

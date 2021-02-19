import { SerializedDoc } from './doc'
import { SerializedFolder } from './folder'

export interface SerializedDocBookmark {
  id: string
  docId: string
  doc?: SerializedDoc
}

export interface SerializedFolderBookmark {
  id: string
  folderId: string
  folder?: SerializedFolder
}

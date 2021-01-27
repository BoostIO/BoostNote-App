import { SerializedUser } from './user'
import { SerializedDoc } from './doc'

export interface SerializedRevision {
  id: number
  title: string
  content: string
  message: string
  createdAt: string
  creators: SerializedUser[]
  docId: string
  doc?: SerializedDoc
}

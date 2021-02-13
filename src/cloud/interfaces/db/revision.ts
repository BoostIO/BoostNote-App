import { SerializedUser } from './user'
import { SerializedDoc } from './doc'

export interface SerializedRevision {
  id: number
  title: string
  content: string
  message: string
  created: string
  creators: SerializedUser[]
  docId: string
  doc?: SerializedDoc
}

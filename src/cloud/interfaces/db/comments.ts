import { SerializedUser } from './user'
import { RelativePosition } from 'yjs'

export interface Thread {
  id: string
  status: {
    at: Date
    type: 'open' | 'closed' | 'outdated'
    by?: SerializedUser
  }
  context: string
  commentCount: number
  lastCommentTime: Date
  contributors: SerializedUser[]
  doc: string
  selection?: { anchor: RelativePosition; head: RelativePosition }
}

export interface Comment {
  id: string
  message: string
  user: SerializedUser
  createdAt: Date
  updatedAt: Date
  thread: string
}

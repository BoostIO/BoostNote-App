import { SerializedUser } from './user'
import { RelativePosition } from 'yjs'
import { CommentReaction } from './commentReaction'

export interface Comment {
  id: string
  message: string
  user: SerializedUser
  createdAt: Date
  updatedAt: Date
  thread: string
}

export interface Thread {
  id: string
  status: {
    at: Date
    type: 'open' | 'closed' | 'outdated'
    by?: SerializedUser
  }
  initialComment?: Comment
  context: string
  commentCount: number
  lastCommentTime: Date
  contributors: SerializedUser[]
  doc: string
  selection?: { anchor: RelativePosition; head: RelativePosition }
  createdAt: Date
}

export interface Comment {
  id: string
  message: string
  user: SerializedUser
  createdAt: Date
  updatedAt: Date
  thread: string
  reactions: CommentReaction[]
}

import { SerializedUser } from './user'

export interface Thread {
  id: string
  status: {
    at: Date
    type: 'open' | 'closed' | 'outdated'
    by?: SerializedUser
  }
  context: string
  commentCount: number
  contributors: SerializedUser[]
  doc: string
  selection?: { anchor: number[]; head: number[] }
}

export interface Comment {
  id: string
  message: string
  user: SerializedUser
  createdAt: Date
  updatedAt: Date
  thread: string
}

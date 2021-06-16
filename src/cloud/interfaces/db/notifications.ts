import { SerializedUser } from './user'

export interface Notification {
  id: string
  title: string
  contextType: string
  context: string
  content: string
  link: string
  target: SerializedUser
  source?: SerializedUser
  createdAt: Date
  viewedAt?: Date
  team: string
}

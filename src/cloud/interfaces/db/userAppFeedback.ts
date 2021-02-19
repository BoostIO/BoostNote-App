import { SerializedUser } from './user'

export interface SerializableUserAppFeedbackProps {
  id: string
  type: string
  feedback: string
}

export interface SerializedUnserializableUserAppFeedbackProps {
  createdAt: string
  user: SerializedUser
}

export type SerializedUserAppFeedback = SerializedUnserializableUserAppFeedbackProps &
  SerializableUserAppFeedbackProps

export type AppFeedbackTypeOption = 'Feature Request' | 'Bug Report'

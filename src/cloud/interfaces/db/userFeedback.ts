export interface SerializableUserFeedbackProps {
  id: string
  feedback: any
  uniqueName: string
}

export interface UnserializableUserFeedbackProps {
  createdAt: Date
}

export interface SerializedUnserializableUserFeedbackProps {
  createdAt: string
}

export type SerializedUserFeedback = SerializedUnserializableUserFeedbackProps &
  SerializableUserFeedbackProps

export interface SerializableErrorReportProps {
  id: number
  name: string
  message?: string
  stack?: string
  from?: string
}

export interface UnserializableErrorReportProps {
  createdAt: Date
  updatedAt: Date
}

export interface SerializedUnserializableErrorReportProps {
  createdAt: string
  updatedAt: string
}

export type SerializedErrorReport = SerializedUnserializableErrorReportProps &
  SerializableErrorReportProps

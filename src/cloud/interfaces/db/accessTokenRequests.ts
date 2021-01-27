import { SerializedUser } from './user'

export interface SerializableAccessTokenRequestProps {
  id: string
  code: string
  secret: string
  active: boolean
}

export interface SerializedUnserializableAccessTokenRequestProps {
  createdAt: string
  updatedAt: string
  user?: SerializedUser | string
}

export type SerializedAccessTokenRequest = SerializedUnserializableAccessTokenRequestProps &
  SerializableAccessTokenRequestProps

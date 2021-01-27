import { SerializedUser } from './user'

export interface SerializableUserAccessTokenProps {
  id: string
  accessToken: string
}

export interface SerializedUnserializableUserAccessTokenProps {
  createdAt: string
  updatedAt: string
  user: SerializedUser
}

export type SerializedUserAccessToken = SerializedUnserializableUserAccessTokenProps &
  SerializableUserAccessTokenProps

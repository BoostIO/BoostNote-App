import { SerializedUser } from './user'
import { SerializedAccessTokenRequest } from './accessTokenRequests'

export interface SerializableAccessTokenProps {
  id: string
  accessToken: string
  active: boolean
}

export interface SerializedUnserializableAccessTokenProps {
  user?: SerializedUser | string
  accessTokenRequest?: SerializedAccessTokenRequest | string
}

export type SerializedAccessToken = SerializedUnserializableAccessTokenProps &
  SerializableAccessTokenProps

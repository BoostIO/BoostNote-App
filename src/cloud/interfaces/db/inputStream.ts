import { SerializedTeam } from './team'

export type InputStreamType = 'github:team'

export interface SerializableInputStreamProps {
  id: string
  type: InputStreamType
  name: string
  teamId: string
  integrationId: string
}

export interface SerializedUnserializableInputStreamProps {
  team: SerializedTeam
  createdAt: string
  sources: SerializedSource[]
}

export type SerializedInputStream = SerializedUnserializableInputStreamProps &
  SerializableInputStreamProps

export interface SerializableSourceProps {
  id: string
  identifier: string
  inputStreamId: string
  integrationId: string
}

export interface SerializedUnserializableSourceProps {
  createdAt: string
  inputStream: SerializedInputStream
}

export type SerializedSource = SerializedUnserializableSourceProps &
  SerializableSourceProps

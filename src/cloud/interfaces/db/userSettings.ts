import { SerializedUser } from './user'
import { UserSettings } from '../../lib/stores/settings/types'

export type UserEmailNotificationType = 'daily' | 'weekly'

export interface SerializableUserSettingsProps {
  id: string
  value: UserSettings
  version: number
  notifications?: {
    summary?: UserEmailNotificationType
  }
}

export interface SerializedUnserializableUserSettingsProps {
  updatedAt: string
  user: SerializedUser
}

export type SerializedUserSettings = SerializedUnserializableUserSettingsProps &
  SerializableUserSettingsProps

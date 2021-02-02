import { SerializedUserSettings } from '../../interfaces/db/userSettings'
import { callApi } from '../../lib/client'

export interface SaveUserSettingsRequestBody {
  value?: string
  emailNotifications?: 'daily' | 'weekly'
}

export interface SaveUserSettingsResponseBody {
  settings: SerializedUserSettings
}

export async function saveUserSettings(body: SaveUserSettingsRequestBody) {
  const data = await callApi<SaveUserSettingsResponseBody>(
    `api/users/settings`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}

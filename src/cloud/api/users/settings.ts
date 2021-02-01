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
  const response = await callApi(`api/users/settings`, {
    json: body,
    method: 'put',
  })
  return response.data as SaveUserSettingsResponseBody
}

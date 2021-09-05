import { callApi } from '../lib/client'
import { SerializedUser, UserOnboardingState } from '../interfaces/db/user'
import { SerializedTeamWithPermissions } from '../interfaces/db/team'
import { SerializedUserSettings } from '../interfaces/db/userSettings'
import { SerializedTeamInvite } from '../interfaces/db/teamInvite'
import { SerializedSubscription } from '../interfaces/db/subscription'

export interface GlobalDataResponseBody {
  currentUser?: SerializedUser
  currentUserSettings?: SerializedUserSettings
  currentUserOnboarding?: UserOnboardingState
  teams: (SerializedTeamWithPermissions & {
    subscription?: SerializedSubscription
  })[]
  invites: SerializedTeamInvite[]
  realtimeAuth?: string
}

/// CURRENT USER INFORMATION
/// model, notifications, settings, team permissions
export interface GlobalData extends GlobalDataResponseBody {
  userAgent?: string
}

export async function getGlobalData() {
  const data = await callApi('api/global')

  return {
    ...data,
  } as GlobalData
}

import { callApi } from '../lib/client'
import { SerializedUser, UserOnboardingState } from '../interfaces/db/user'
import { SerializedTeam } from '../interfaces/db/team'
import { SerializedUserSettings } from '../interfaces/db/userSettings'
import { SerializedTeamInvite } from '../interfaces/db/teamInvite'
import { SerializedSubscription } from '../interfaces/db/subscription'
import { SerializedUserTeamPermissions } from '../interfaces/db/userTeamPermissions'

export interface GlobalDataResponseBody {
  currentUser?: SerializedUser
  currentUserSettings?: SerializedUserSettings
  currentUserOnboarding?: UserOnboardingState
  teams: (SerializedTeam & {
    subscription?: SerializedSubscription
    permissions: SerializedUserTeamPermissions[]
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

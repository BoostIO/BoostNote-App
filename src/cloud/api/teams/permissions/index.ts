import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DestroyPermissionResponseBody {}

export async function destroyPermission(
  team: SerializedTeam,
  userPermissions: SerializedUserTeamPermissions
) {
  const data = await callApi<DestroyPermissionResponseBody>(
    `api/teams/${team.id}/permissions/${userPermissions.id}`,
    { method: 'delete' }
  )
  return data
}

export interface CreatePermissionsResponseBody {
  userPermissions: SerializedUserTeamPermissions
}

type CreatePermissionsTeamInviteRequestBody = {
  type: 'invite'
  userId: string
  inviteId: string
}

type CreatePermissionsOpenInviteRequestBody = {
  type: 'open'
  userId: string
  inviteId: string
}

export type CreatePermissionsRequestBody =
  | CreatePermissionsTeamInviteRequestBody
  | CreatePermissionsOpenInviteRequestBody

export async function createPermissions(
  team: SerializedTeam,
  body: CreatePermissionsRequestBody
) {
  const data = await callApi<CreatePermissionsResponseBody>(
    `api/teams/${team.id}/permissions`,
    {
      json: body,
      method: 'post',
    }
  )
  return data
}

export interface AlterPermissionResponseBody {
  permissions: SerializedUserTeamPermissions
}

export async function updatePermissionRole(
  team: SerializedTeam,
  userPermissions: SerializedUserTeamPermissions,
  role: string
) {
  const data = await callApi<AlterPermissionResponseBody>(
    `api/teams/${team.id}/permissions/${userPermissions.id}`,
    { json: { role }, method: 'put' }
  )
  return data
}

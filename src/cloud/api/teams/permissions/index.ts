import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import report from '../../../lib/analytics'
import { PermissionType } from 'aws-sdk/clients/workmail'

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
  report('delete_member')
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
  report('create_member')
  return data
}

export interface AlterPermissionResponseBody {
  permissions: SerializedUserTeamPermissions
}

export async function updatePermissionRole(
  team: SerializedTeam,
  userPermissions: SerializedUserTeamPermissions,
  role: PermissionType
) {
  const data = await callApi<AlterPermissionResponseBody>(
    `api/teams/${team.id}/permissions/${userPermissions.id}`,
    { json: { role }, method: 'put' }
  )
  return data
}

import { buildIconUrl } from '../../../cloud/api/files'
import { SerializedUser } from '../../../cloud/interfaces/db/user'
import { SerializedUserTeamPermissions } from '../../../cloud/interfaces/db/userTeamPermissions'
import { getColorFromString } from '../string'

export type AppUser = {
  userId: string
  name: string
  iconUrl?: string
  currentUser?: boolean
  color: string
} & { type: 'member'; teamPermissionsId: string }

export function mapUsers(
  permissions: SerializedUserTeamPermissions[],
  currentUser?: SerializedUser
) {
  const map = new Map<string, AppUser>()
  permissions.forEach((val) => {
    map.set(val.user.id, {
      type: 'member',
      teamPermissionsId: val.id,
      userId: val.user.id,
      name: val.user.displayName,
      iconUrl:
        val.user.icon != null
          ? buildIconUrl(val.user.icon.location)
          : undefined,
      currentUser: val.user.id === currentUser?.id,
      color: getColorFromString(val.user.id),
    })
  })

  return map
}

export function mapUsersWithAccess(
  permissions: SerializedUserTeamPermissions[],
  access: { permissions: Set<string>; owner?: string },
  currentUser?: SerializedUser
) {
  const map = new Map<
    string,
    AppUser & { hasAccess?: boolean; isOwner?: boolean }
  >()
  permissions.forEach((val) => {
    map.set(val.user.id, {
      type: 'member',
      teamPermissionsId: val.id,
      userId: val.user.id,
      name: val.user.displayName,
      hasAccess: access.permissions.has(val.id) || access.owner === val.id,
      isOwner: access.owner === val.id,
      color: getColorFromString(val.user.id),
      iconUrl:
        val.user.icon != null
          ? buildIconUrl(val.user.icon.location)
          : undefined,
      currentUser: val.user.id === currentUser?.id,
    })
  })

  return map
}

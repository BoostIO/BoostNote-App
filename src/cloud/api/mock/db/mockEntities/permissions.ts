import {
  SerializedUserTeamPermissions,
  TeamPermissionType,
} from '../../../../interfaces/db/userTeamPermissions'
import {
  generateMockId,
  getCurrentTime,
  MockDbMap,
  MockDbSetMap,
} from '../utils'

export type MockPermission = Omit<
  SerializedUserTeamPermissions,
  'user' | 'team'
>
const permissionsMap = new MockDbMap<MockPermission>('mock:permissionsMap')
const userPermissionsSetMap = new MockDbSetMap<string>(
  'mock:userPermissionsSetMap'
)
const teamPermissionsSetMap = new MockDbSetMap<string>(
  'mock:teamPermissionsSetMap'
)

export function resetMockPermissions() {
  permissionsMap.reset()
  userPermissionsSetMap.reset()
  teamPermissionsSetMap.reset()
}

interface CreateMockPermissionsParams {
  userId: string
  teamId: string
  role: TeamPermissionType
}

export function createMockPermissions({
  userId,
  teamId,
  role,
}: CreateMockPermissionsParams) {
  const id = generateMockId()
  const now = getCurrentTime()

  const newPermissions = {
    id,
    userId,
    teamId,
    role,
    createdAt: now,
    updatedAt: now,
  }

  permissionsMap.set(id, newPermissions)

  userPermissionsSetMap.addValue(userId, id)
  teamPermissionsSetMap.addValue(teamId, id)

  return newPermissions
}

export function getMockPermissionsById(id: string) {
  return permissionsMap.get(id)
}

export function getMockPermissionsListByUserId(userId: string) {
  const permissionIdList = [...userPermissionsSetMap.getSet(userId)]

  return permissionIdList.reduce<MockPermission[]>((list, permissionId) => {
    const permission = getMockPermissionsById(permissionId)
    if (permission != null) {
      list.push(permission)
    }
    return list
  }, [])
}

export function getMockPermissionsListByTeamId(teamId: string) {
  const permissionIdList = [...teamPermissionsSetMap.getSet(teamId)]

  return permissionIdList.reduce<MockPermission[]>((list, permissionId) => {
    const permission = getMockPermissionsById(permissionId)
    if (permission != null) {
      list.push(permission)
    }
    return list
  }, [])
}

export function removeMockPermissionsById(id: string) {
  const permission = getMockPermissionsById(id)
  if (permission == null) {
    return
  }
  permissionsMap.delete(id)
  userPermissionsSetMap.removeValue(permission.userId, id)
  teamPermissionsSetMap.removeValue(permission.teamId, id)
}

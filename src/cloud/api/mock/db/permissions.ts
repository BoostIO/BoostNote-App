import {
  SerializedUserTeamPermissions,
  TeamPermissionType,
} from '../../../interfaces/db/userTeamPermissions'
import { generateMockId, getCurrentTime } from './utils'

type MockPermission = Omit<SerializedUserTeamPermissions, 'user' | 'team'>
const permissionsMap = new Map<string, MockPermission>()
const userPermissionsSetMap = new Map<string, Set<string>>()
const teamPermissionsSetMap = new Map<string, Set<string>>()

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

  addUserPermissionsSet(id, userId)
  addTeamPermissionsSet(id, teamId)

  return newPermissions
}

export function getMockPermissionsById(id: string) {
  return permissionsMap.get(id)
}

export function getMockPermissionsListByUserId(userId: string) {
  const permissionIdList = [...getUserPermissionsSet(userId)]

  return permissionIdList.reduce<MockPermission[]>((list, permissionId) => {
    const permission = getMockPermissionsById(permissionId)
    if (permission != null) {
      list.push(permission)
    }
    return list
  }, [])
}

export function getMockPermissionsListByTeamId(teamId: string) {
  const permissionIdList = [...getTeamPermissionsSet(teamId)]

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
  removeUserPermissionsSet(id, permission.userId)
  removeTeamPermissionsSet(id, permission.teamId)
}

function getUserPermissionsSet(userId: string) {
  return userPermissionsSetMap.get(userId) || new Set()
}

function addUserPermissionsSet(permissionId: string, userId: string) {
  const userPermissionsSet = getUserPermissionsSet(userId)
  userPermissionsSet.add(permissionId)
  userPermissionsSetMap.set(permissionId, userPermissionsSet)
}

function removeUserPermissionsSet(permissionId: string, userId: string) {
  const userPermissionsSet = getUserPermissionsSet(userId)
  userPermissionsSet.delete(permissionId)
  userPermissionsSetMap.set(permissionId, userPermissionsSet)
}

function getTeamPermissionsSet(teamId: string) {
  return teamPermissionsSetMap.get(teamId) || new Set()
}

function addTeamPermissionsSet(permissionId: string, teamId: string) {
  const teamPermissionsSet = getTeamPermissionsSet(teamId)
  teamPermissionsSet.add(permissionId)
  teamPermissionsSetMap.set(permissionId, teamPermissionsSet)
}

function removeTeamPermissionsSet(permissionId: string, teamId: string) {
  const teamPermissionsSet = getTeamPermissionsSet(teamId)
  teamPermissionsSet.delete(permissionId)
  teamPermissionsSetMap.set(permissionId, teamPermissionsSet)
}

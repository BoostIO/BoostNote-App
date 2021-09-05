import { SerializedUser } from '../../../interfaces/db/user'
import { generateMockId, getCurrentTime } from './utils'

const userMap = new Map<string, SerializedUser>()

interface CreateMockUserParams {
  displayName?: string
  uniqueName?: string
}

export function createMockUser({
  displayName,
  uniqueName,
}: CreateMockUserParams = {}) {
  const id = generateMockId()
  if (displayName == null) {
    displayName = id
  }
  if (uniqueName == null) {
    uniqueName = id
  }
  const now = getCurrentTime()
  const newUser = {
    id: id,
    uniqueName,
    displayName,
    createdAt: now,
    updatedAt: now,
  }

  userMap.set(newUser.id, newUser)
  return newUser
}

export function getMockUserById(id: string) {
  return userMap.get(id)
}

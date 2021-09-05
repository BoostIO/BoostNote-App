import { DocStatus, SerializedDoc } from '../../../interfaces/db/doc'
import { generateMockId, getCurrentTime } from './utils'

export type MockDoc = Omit<SerializedDoc, 'team' | 'tags'>
const docMap = new Map<string, MockDoc>()

interface CraeteMockDocParams {
  title: string
  emoji?: string
  folderPathname: string
  generated?: boolean
  teamId: string
  workspaceId: string
  status?: DocStatus
  dueDate?: string
  userId: string
}

export function createMockDoc({
  title,
  emoji,
  folderPathname,
  generated = false,
  teamId,
  workspaceId,
  status,
  dueDate,
  userId,
}: CraeteMockDocParams) {
  const id = generateMockId()
  const now = getCurrentTime()

  const newDoc = {
    id,
    title,
    emoji,
    folderPathname,
    generated,
    teamId,
    workspaceId,
    status,
    version: 0,
    dueDate,
    userId,
    createdAt: now,
    updatedAt: now,
  }

  docMap.set(id, newDoc)

  return newDoc
}

export function getMockDocById(id: string) {
  return docMap.get(id)
}

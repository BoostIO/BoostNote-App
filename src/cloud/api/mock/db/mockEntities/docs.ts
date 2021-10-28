import { DocStatus, SerializedDoc } from '../../../../interfaces/db/doc'
import {
  generateMockId,
  getCurrentTime,
  MockDbMap,
  MockDbSetMap,
} from '../utils'

export type MockDoc = Omit<SerializedDoc, 'team' | 'tags' | 'folderPathname'>

const docMap = new MockDbMap<MockDoc>('mock:docMap')
const teamDocIdSetMap = new MockDbSetMap<string>('mock:teamDocIdSetMap')

export function resetMockDocs() {
  docMap.reset()
  teamDocIdSetMap.reset()
}

interface CraeteMockDocParams {
  title: string
  emoji?: string
  parentFolderId?: string
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
  parentFolderId,
  generated = false,
  teamId,
  workspaceId,
  userId,
}: CraeteMockDocParams) {
  const id = generateMockId()
  const now = getCurrentTime()

  const newDoc: MockDoc = {
    id,
    title,
    emoji,
    parentFolderId,
    generated,
    teamId,
    workspaceId,
    version: 0,
    userId,
    createdAt: now,
    updatedAt: now,
  }

  docMap.set(id, newDoc)

  teamDocIdSetMap.addValue(teamId, id)

  return newDoc
}

export function getMockDocById(id: string) {
  return docMap.get(id)
}

export function getTeamMockDocs(teamId: string) {
  const teamDocIdList = [...teamDocIdSetMap.getSet(teamId)]

  return teamDocIdList.reduce<MockDoc[]>((list, docId) => {
    const doc = getMockDocById(docId)
    if (doc != null) {
      list.push(doc)
    }
    return list
  }, [])
}

import { SerializedFolder } from '../../../../interfaces/db/folder'
import {
  generateMockId,
  getCurrentTime,
  MockDbMap,
  MockDbSetMap,
} from '../utils'

export type MockFolder = Omit<
  SerializedFolder,
  | 'team'
  | 'pathname'
  | 'childDocsIds'
  | 'childFoldersIds'
  | 'positions'
  | 'childFolders'
  | 'childDocs'
>
const folderMap = new MockDbMap<MockFolder>('mock:folderMap')
const childFolderIdSetMap = new MockDbSetMap<string>('mock:childFolderIdSet')
const teamFolderIdSetMap = new MockDbSetMap<string>('mock:teamFolderIdSet')

export function resetMockFolders() {
  folderMap.reset()
  childFolderIdSetMap.reset()
  teamFolderIdSetMap.reset()
}

interface CreateMockFolderParams {
  emoji?: string
  name: string
  description?: string
  teamId: string
  generated?: boolean
  parentFolderId?: string
  workspaceId: string
}

export function createMockFolder({
  emoji,
  name,
  description = '',
  teamId,
  generated = false,
  parentFolderId,
  workspaceId,
}: CreateMockFolderParams) {
  const id = generateMockId()
  const now = getCurrentTime()

  const newFolder: MockFolder = {
    id,
    emoji,
    name,
    description,
    teamId,
    generated,
    parentFolderId,
    workspaceId,
    version: 0,
    createdAt: now,
    updatedAt: now,
  }

  if (parentFolderId != null) {
    childFolderIdSetMap.addValue(parentFolderId, id)
  }

  folderMap.set(id, newFolder)
  teamFolderIdSetMap.addValue(teamId, id)

  return newFolder
}

export function getMockFolderById(id: string) {
  return folderMap.get(id)
}

export function getChildFolderList(id: string) {
  const childFolderIdList = [...childFolderIdSetMap.getSet(id)]

  return getMockFolderListByIdList(childFolderIdList)
}

export function removeMockFolder(id: string) {
  const folder = getMockFolderById(id)
  const childFolderList = getChildFolderList(id)
  for (const childFolder of childFolderList) {
    removeMockFolder(childFolder.id)
    childFolderIdSetMap.removeValue(id, childFolder.id)
  }

  folderMap.delete(id)
  childFolderIdSetMap.removeSet(id)
  if (folder != null) {
    teamFolderIdSetMap.addValue(folder.teamId, id)
  }
}

export function getMockTeamFolders(teamId: string) {
  const idList = [...teamFolderIdSetMap.getSet(teamId)]

  return getMockFolderListByIdList(idList)
}

function getMockFolderListByIdList(idList: string[]) {
  return idList.reduce<MockFolder[]>((list, folderId) => {
    const folder = getMockFolderById(folderId)
    if (folder != null) {
      list.push(folder)
    }
    return list
  }, [])
}

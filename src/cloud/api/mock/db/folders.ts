import { SerializedFolder } from '../../../interfaces/db/folder'
import { generateMockId, getCurrentTime, SetMap } from './utils'

type MockFolder = Omit<
  SerializedFolder,
  | 'team'
  | 'pathname'
  | 'childDocsIds'
  | 'childFoldersIds'
  | 'positions'
  | 'childFolders'
  | 'childDocs'
>
const folderMap = new Map<string, MockFolder>()
const childFolderIdSetMap = new SetMap<string>()

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

  return newFolder
}

export function getMockFolderById(id: string) {
  return folderMap.get(id)
}

export function getChildFolderList(id: string) {
  const childFolderIdList = [...childFolderIdSetMap.getSet(id)]

  return childFolderIdList.reduce<MockFolder[]>((list, childFolderId) => {
    const childFolder = getMockFolderById(childFolderId)
    if (childFolder != null) {
      list.push(childFolder)
    }
    return list
  }, [])
}

export function removeFolder(id: string) {
  const childFolderList = getChildFolderList(id)
  for (const childFolder of childFolderList) {
    removeFolder(childFolder.id)
    childFolderIdSetMap.removeValue(id, childFolder.id)
  }

  folderMap.delete(id)
  childFolderIdSetMap.removeSet(id)
}

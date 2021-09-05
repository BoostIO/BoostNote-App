import { SerializedFolder } from '../../../interfaces/db/folder'
import { generateMockId, getCurrentTime } from './utils'

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
const childFolderIdSetMap = new Map<string, Set<string>>()

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
    addChildFolder(parentFolderId, id)
  }

  folderMap.set(id, newFolder)

  return newFolder
}

export function getMockFolderById(id: string) {
  return folderMap.get(id)
}

export function getChildFolderList(id: string) {
  const childFolderIdList = [...getChildFolderSet(id)]

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
    removeChildFolder(id, childFolder.id)
  }

  folderMap.delete(id)
  childFolderIdSetMap.delete(id)
}

function getChildFolderSet(id: string) {
  return childFolderIdSetMap.get(id) || new Set<string>()
}

function addChildFolder(id: string, childId: string) {
  const childFolderIdSet = getChildFolderSet(id)
  childFolderIdSet.add(childId)
  childFolderIdSetMap.set(id, childFolderIdSet)
}

function removeChildFolder(id: string, childId: string) {
  const childFolderIdSet = getChildFolderSet(id)
  childFolderIdSet.delete(childId)
  childFolderIdSetMap.set(id, childFolderIdSet)
}

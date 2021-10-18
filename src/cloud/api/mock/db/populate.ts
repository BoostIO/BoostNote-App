import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { MockDoc } from './mockEntities/docs'
import { getMockFolderById, MockFolder } from './mockEntities/folders'
import { MockPermission } from './mockEntities/permissions'
import { getMockTeamById } from './mockEntities/teams'
import { getMockUserById } from './mockEntities/users'
import { MockWorkspace } from './mockEntities/workspaces'

export function populateFolder(
  mockFolder: MockFolder
): SerializedFolderWithBookmark {
  return {
    ...mockFolder,
    pathname: '',
    positions: { id: 'mock', orderedIds: [], updatedAt: '' },
    childDocs: [],
    childFolders: [],
    childDocsIds: [],
    childFoldersIds: [],
    bookmarked: false,
  }
}

export function populatePermissions(
  mockPermissions: MockPermission
): SerializedUserTeamPermissions {
  const { teamId, userId } = mockPermissions
  const user = getMockUserById(userId)!
  const team = getMockTeamById(teamId)!
  return {
    ...mockPermissions,
    user,
    team,
  }
}

export function populateDoc(mockDoc: MockDoc): SerializedDocWithSupplemental {
  const team = getMockTeamById(mockDoc.teamId)!
  return {
    ...mockDoc,
    folderPathname: getFolderPathname(mockDoc.parentFolderId),
    tags: [],
    bookmarked: false,
    team,
    props: {},
  }
}

export function getFolderPathname(folderId?: string) {
  if (folderId == null) {
    return '/'
  }
  const folderNames = []
  let parentFolder = getMockFolderById(folderId)
  while (parentFolder != null) {
    folderNames.push(parentFolder.name)
    parentFolder =
      parentFolder.parentFolderId != null
        ? getMockFolderById(parentFolder.parentFolderId)
        : undefined
  }

  return '/' + folderNames.reverse().join('/')
}

export function populateWorkspace(
  mockWorkspace: MockWorkspace
): SerializedWorkspace {
  return {
    ...mockWorkspace,
  }
}

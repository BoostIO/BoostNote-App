import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { MockDoc } from './docs'
import { MockFolder } from './folders'
import { MockPermission } from './permissions'
import { getMockTeamById } from './teams'
import { getMockUserById } from './users'

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

export function populateDoc(mockDoc: MockDoc): SerializedDocWithBookmark {
  const team = getMockTeamById(mockDoc.teamId)!
  return {
    ...mockDoc,
    tags: [],
    bookmarked: false,
    team,
  }
}

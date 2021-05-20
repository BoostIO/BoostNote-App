import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../interfaces/db/folder'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../../interfaces/db/doc'
import { NavResource } from '../../../interfaces/resources'
import { SidebarDragState } from '../../dnd'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'
import {
  CreateFolderRequestBody,
  UpdateFolderRequestBody,
} from '../../../api/teams/folders'
import {
  CreateDocRequestBody,
  UpdateDocRequestBody,
} from '../../../api/teams/docs'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedTemplate } from '../../../interfaces/db/template'
import { SerializedSmartFolder } from '../../../interfaces/db/smartFolder'

export interface NavContext {
  initialLoadDone: boolean
  sideNavCreateButtonState: string | undefined
  setSideNavCreateButtonState: (value?: string) => void
  currentPath: string
  setCurrentPath: (value: string) => void
  currentParentFolderId?: string
  currentWorkspaceId?: string
  currentParentFolder?: SerializedFolderWithBookmark
  tagsMap: Map<string, SerializedTag>
  templatesMap: Map<string, SerializedTemplate>
  workspacesMap: Map<string, SerializedWorkspace>
  updateWorkspacesMap: (
    ...mappedWorkspaces: [string, SerializedWorkspace][]
  ) => void
  removeFromWorkspacesMap: (...ids: string[]) => void
  updateTagsMap: (...mappedTag: [string, SerializedTag][]) => void
  removeFromTagsMap: (...ids: string[]) => void
  setTemplatesMap: (map: Map<string, SerializedTemplate>) => void
  updateTemplatesMap: (
    ...mappedTemplate: [string, SerializedTemplate][]
  ) => void
  removeFromTemplatesMap: (...ids: string[]) => void
  foldersMap: Map<string, SerializedFolderWithBookmark>
  updateFoldersMap: (
    ...mappedFolder: [string, SerializedFolderWithBookmark][]
  ) => void
  removeFromFoldersMap: (...ids: string[]) => void
  docsMap: Map<string, SerializedDocWithBookmark>
  updateDocsMap: (...mappedDoc: [string, SerializedDocWithBookmark][]) => void
  updateParentFolderOfDoc: (doc: SerializedDocWithBookmark) => void
  removeFromDocsMap: (...ids: string[]) => void

  smartFoldersMap: Map<string, SerializedSmartFolder>
  updateSmartFoldersMap: (
    ...smartFolders: [string, SerializedSmartFolder][]
  ) => void
  removeFromSmartFoldersMap: (...ids: string[]) => void
  createFolderHandler: (body: CreateFolderRequestBody) => void
  updateFolderHandler: (
    folder: SerializedFolderWithBookmark | SerializedFolder,
    body: UpdateFolderRequestBody
  ) => void
  deleteFolderHandler: (
    folder: SerializedFolderWithBookmark | SerializedFolder
  ) => void
  createDocHandler: (body: CreateDocRequestBody) => void
  updateDocHandler: (
    doc: SerializedDoc | SerializedDocWithBookmark,
    body: UpdateDocRequestBody
  ) => void
  deleteDocHandler: (doc: SerializedDocWithBookmark | SerializedDoc) => void
  moveResourceHandler: (
    draggedResource: NavResource,
    targetedResource: NavResource,
    targetedPosition: SidebarDragState
  ) => void
  eventSourceResourceUpdateHandler: (event: SerializedAppEvent) => void
}

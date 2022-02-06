import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../interfaces/db/folder'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
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
import { SerializedSmartView } from '../../../interfaces/db/smartView'
import { SerializedView } from '../../../interfaces/db/view'
import { SerializedDashboard } from '../../../interfaces/db/dashboard'

export interface NavContext {
  initialLoadDone: boolean
  mapsInitializedByProps: boolean
  sideNavCreateButtonState: string | undefined
  setSideNavCreateButtonState: (value?: string) => void
  currentPath: string
  setCurrentPath: (value: string) => void
  currentParentFolderId?: string
  currentWorkspaceId?: string
  currentParentFolder?: SerializedFolderWithBookmark
  tagsMap: Map<string, SerializedTag>
  templatesMap: Map<string, SerializedTemplate>
  dashboardsMap: Map<string, SerializedDashboard>
  updateDashboardsMap: (...dashboards: [string, SerializedDashboard][]) => void
  removeFromDashboardsMap: (...ids: string[]) => void
  viewsMap: Map<number, SerializedView>
  updateViewsMap: (...newViews: [number, SerializedView][]) => void
  removeFromViewsMap: (...ids: number[]) => void
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
  loadDoc: (
    id: string,
    team: string
  ) => Promise<SerializedDocWithSupplemental | undefined>
  docsMap: Map<string, SerializedDocWithSupplemental>
  updateDocsMap: (
    ...mappedDoc: [string, SerializedDocWithSupplemental][]
  ) => void
  updateParentFolderOfDoc: (doc: SerializedDocWithSupplemental) => void
  removeFromDocsMap: (...ids: string[]) => void
  smartViewsMap: Map<string, SerializedSmartView>
  appEventsMap: Map<string, SerializedAppEvent>
  updateAppEventsMap: (...mappedEvents: [string, SerializedAppEvent][]) => void
  updateSmartViewsMap: (
    ...smartViewFolders: [string, SerializedSmartView][]
  ) => void
  removeFromSmartViewsMap: (...ids: string[]) => void
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
    doc: SerializedDoc | SerializedDocWithSupplemental,
    body: UpdateDocRequestBody
  ) => void
  deleteDocHandler: (doc: SerializedDocWithSupplemental | SerializedDoc) => void
  moveResourceHandler: (
    draggedResource: NavResource,
    targetedResource: NavResource,
    targetedPosition: SidebarDragState
  ) => void
  eventSourceResourceUpdateHandler: (event: SerializedAppEvent) => void
  updateParentWorkspaceOfDoc: (doc: SerializedDocWithSupplemental) => void
}

import { SerializedSmartView } from './smartView'
import { SerializedFolder, SerializedFolderWithBookmark } from './folder'
import { SerializedWorkspace } from './workspace'
import { ViewTableData } from '../../lib/views/table'

export type SupportedViewTypes = 'table' | 'calendar' | 'kanban'

export interface ViewState {
  integrations: string[]
}

export interface SerializableViewProps {
  id: number
  name: string
  folderId?: string
  smartViewId?: string
  workspaceId?: string
  type: SupportedViewTypes
  data: ViewTableData
  order: string
}

export interface SerializedUnserializableViewProps {
  folder?: SerializedFolder
  smartView?: SerializedSmartView
  workspace?: SerializedWorkspace
}

export type SerializedView = SerializedUnserializableViewProps &
  SerializableViewProps

export type ViewParent =
  | { type: 'workspace'; target: SerializedWorkspace }
  | { type: 'folder'; target: SerializedFolderWithBookmark }
  | { type: 'smartView'; target: SerializedSmartView }

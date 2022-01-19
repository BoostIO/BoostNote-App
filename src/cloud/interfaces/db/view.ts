import { SerializedSmartView } from './smartView'
import { SerializedFolder, SerializedFolderWithBookmark } from './folder'
import { SerializedWorkspace } from './workspace'

export type SupportedViewTypes = 'table' | 'calendar' | 'kanban' | 'list'

export interface ViewState {
  integrations: string[]
}

export interface SerializableViewProps<T> {
  id: number
  shortId: string
  name: string
  folderId?: string
  smartViewId?: string
  workspaceId?: string
  type: SupportedViewTypes
  data: T
  order: string
}

export interface SerializedUnserializableViewProps {
  folder?: SerializedFolder
  smartView?: SerializedSmartView
  workspace?: SerializedWorkspace
}

export type SerializedView<T = any> = SerializedUnserializableViewProps &
  SerializableViewProps<T>

export type ViewParent =
  | { type: 'workspace'; target: SerializedWorkspace }
  | { type: 'folder'; target: SerializedFolderWithBookmark }
  | { type: 'smartView'; target: SerializedSmartView }

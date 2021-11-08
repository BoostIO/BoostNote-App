import { SerializedSmartView } from './smartView'
import { SerializedFolder, SerializedFolderWithBookmark } from './folder'

export type SupportedViewTypes = 'table'

export interface ViewState {
  integrations: string[]
}

export interface SerializableViewProps {
  id: number
  folderId?: string
  smartViewId?: string
  type: SupportedViewTypes
  data: Object
}

export interface SerializedUnserializableViewProps {
  folder?: SerializedFolder
  smartView: SerializedSmartView
}

export type SerializedView = SerializedUnserializableViewProps &
  SerializableViewProps

export type ViewParent =
  | { type: 'folder'; target: SerializedFolderWithBookmark }
  | { type: 'smartView'; target: SerializedSmartView }

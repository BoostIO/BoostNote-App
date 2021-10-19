import { SerializedDashboard } from './dashboard'
import { SerializedFolder } from './folder'

export type SupportedViewTypes = 'table'

export interface ViewState {
  integrations: string[]
}

export interface SerializableViewProps {
  id: number
  folderId?: string
  dashboardId?: string
  type: SupportedViewTypes
  data: Object
}

export interface SerializedUnserializableViewProps {
  folder?: SerializedFolder
  dashboard: SerializedDashboard
}

export type SerializedView = SerializedUnserializableViewProps &
  SerializableViewProps

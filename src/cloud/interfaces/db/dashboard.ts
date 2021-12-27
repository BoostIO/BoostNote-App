import { SerializedUserTeamPermissions } from './userTeamPermissions'
import { SerializedSmartView } from './smartView'

interface SerializableDashboardProps {
  id: string
  name: string
  ownerId: string
  data: object
}

interface SerializedUnserializableDashboardProps {
  owner?: SerializedUserTeamPermissions
  smartViews?: SerializedSmartView[]
  createdAt: string
}

export type SerializedDashboard = SerializableDashboardProps &
  SerializedUnserializableDashboardProps

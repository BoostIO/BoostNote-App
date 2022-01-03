import { SerializedUserTeamPermissions } from './userTeamPermissions'
import { SerializedSmartView } from './smartView'
import { Layout } from 'react-grid-layout'

interface SerializableDashboardProps {
  id: string
  name: string
  ownerId: string
  data: DashboardData
}

interface SerializedUnserializableDashboardProps {
  owner?: SerializedUserTeamPermissions
  smartViews?: SerializedSmartView[]
  createdAt: string
}

export type SerializedDashboard = SerializableDashboardProps &
  SerializedUnserializableDashboardProps

export type DashboardData = {
  itemsLayouts: Layout[]
}

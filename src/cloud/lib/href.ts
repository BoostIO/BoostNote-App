import { SerializedTeam } from '../interfaces/db/team'
import { SerializedDashboard } from '../interfaces/db/dashboard'
import { getTeamURL } from './utils/patterns'
import querystring from 'querystring'

export type DashboardRouteIntent = 'index'

export function getDashboardHref(
  dashboardFolder: SerializedDashboard,
  team: SerializedTeam,
  intent: DashboardRouteIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}/smart-folders/${encodeURIComponent(
    dashboardFolder.id
  )}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

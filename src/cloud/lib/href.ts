import { SerializedTeam } from '../interfaces/db/team'
import { SerializedDashboardFolder } from '../interfaces/db/dashboardFolder'
import { getTeamURL } from './utils/patterns'
import querystring from 'querystring'

export type DashboardFolderRouteIntent = 'index'

export function getDashboardFolderHref(
  dashboardFolder: SerializedDashboardFolder,
  team: SerializedTeam,
  intent: DashboardFolderRouteIntent,
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

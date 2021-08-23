import { SerializedTeam } from '../interfaces/db/team'
import { SerializedSmartFolder } from '../interfaces/db/smartFolder'
import { getTeamURL } from './utils/patterns'
import querystring from 'querystring'

export type SmartFolderRouteIntent = 'index'

export function getSmartFolderHref(
  smartFolder: SerializedSmartFolder,
  team: SerializedTeam,
  intent: SmartFolderRouteIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}/smart-folders/${encodeURIComponent(
    smartFolder.id
  )}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

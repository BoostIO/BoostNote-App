import React, { useCallback, MouseEvent } from 'react'
import querystring from 'querystring'
import { getWorkspaceURL, getTeamURL } from '../../../lib/utils/patterns'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useNavigateToTeam } from './TeamLink'
import { useRouter } from '../../../lib/router'

export type WorkspaceLinkIntent = 'index'

interface WorkspaceLinkProps {
  workspace: SerializedWorkspace
  team: SerializedTeam
  draggable?: boolean
  intent?: WorkspaceLinkIntent
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  tabIndex?: number
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const WorkspaceLink = ({
  intent = 'index',
  workspace,
  team,
  className,
  style,
  children,
  query,
  onClick,
  draggable = false,
  onFocus,
  tabIndex,
  id,
}: WorkspaceLinkProps) => {
  const { push } = useRouter()
  const href = getWorkspaceHref(workspace, team, intent, query)
  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      push(href)
    },
    [push, href]
  )
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={onClick != null ? navigate : onClick}
      draggable={draggable}
      onFocus={onFocus}
      tabIndex={tabIndex}
      id={id}
    >
      {children}
    </a>
  )
}

export default WorkspaceLink

function getWorkspaceHref(
  workspace: SerializedWorkspace,
  team: SerializedTeam,
  intent: WorkspaceLinkIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}${getWorkspaceURL(workspace)}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

export function useNavigateToWorkspace() {
  const { push } = useRouter()
  const navigateToTeam = useNavigateToTeam()
  return useCallback(
    (
      workspace: SerializedWorkspace,
      team: SerializedTeam,
      intent: WorkspaceLinkIntent,
      query?: any
    ) => {
      if (workspace.default) {
        navigateToTeam(team, 'index', query)
        return
      }

      push(getWorkspaceHref(workspace, team, intent, query))
    },
    [navigateToTeam, push]
  )
}

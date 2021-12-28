import React, { MouseEvent, useCallback } from 'react'
import querystring from 'querystring'
import { getTeamURL } from '../../lib/utils/patterns'
import { SerializedDashboard } from '../../interfaces/db/dashboard'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../../lib/router'

export type DashboardLinkIntent = 'index'

interface DashboardLinkProps {
  tag: SerializedDashboard
  team: SerializedTeam
  draggable?: boolean
  intent?: DashboardLinkIntent
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  tabIndex?: number
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const DashboardLink = ({
  intent = 'index',
  tag,
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
}: DashboardLinkProps) => {
  const href = getDashboardHref(tag, team, intent, query)
  const { push } = useRouter()
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
      onClick={onClick != null ? onClick : navigate}
      draggable={draggable}
      onFocus={onFocus}
      tabIndex={tabIndex}
      id={id}
    >
      {children}
    </a>
  )
}

export default DashboardLink

export function getDashboardHref(
  dashboard: SerializedDashboard,
  team: SerializedTeam,
  intent: DashboardLinkIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}/dashboards/${dashboard.id}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

export function useNavigateToDashboard() {
  const { push } = useRouter()

  return useCallback(
    (
      tag: SerializedDashboard,
      team: SerializedTeam,
      intent: DashboardLinkIntent,
      query?: any
    ) => {
      const href = getDashboardHref(tag, team, intent, query)
      push(href)
    },
    [push]
  )
}

import React, { useCallback } from 'react'
import querystring from 'querystring'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../../lib/router'
import CloudLink from './CloudLink'

export type TeamLinkIntent =
  | 'index'
  | 'archived'
  | 'invites'
  | 'uploads'
  | 'blocks'
  | 'blocks/new'
  | 'timeline'
  | 'delete'
  | 'shared'
  | 'requests/deny'
  | 'dashboard'
  | 'workflows'
  | 'automations'

export interface TeamIdProps {
  id: string
  domain?: string
}

interface TeamLinkProps {
  team: TeamIdProps
  intent?: TeamLinkIntent
  className?: string
  children?: React.ReactNode
  query?: any
  beforeNavigate?: () => void
  tabIndex?: number
  onFocus?: () => void
  id?: string
}

const TeamLink = ({
  intent = 'index',
  team,
  className,
  children,
  query,
  beforeNavigate,
  onFocus,
  id,
  tabIndex = 0,
}: TeamLinkProps) => {
  return (
    <CloudLink
      href={getTeamLinkHref(team, intent, query)}
      className={className}
      beforeNavigate={beforeNavigate}
      onFocus={onFocus}
      tabIndex={tabIndex}
      id={id}
    >
      {children}
    </CloudLink>
  )
}

export default TeamLink

export function getTeamLinkHref(
  team: TeamIdProps,
  intent: TeamLinkIntent,
  query?: any
) {
  const basePathname = `/${team.domain != null ? team.domain : team.id}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

export function useNavigateToTeam() {
  const { push } = useRouter()

  return useCallback(
    (team: SerializedTeam, intent: TeamLinkIntent, query?: any) => {
      const href = getTeamLinkHref(team, intent, query)
      push(href)
    },
    [push]
  )
}

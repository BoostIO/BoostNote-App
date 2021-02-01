import React from 'react'
import querystring from 'querystring'
import { getTeamURL } from '../../../lib/utils/patterns'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedTeam } from '../../../interfaces/db/team'

export type TagLinkIntent = 'index'

interface TagLinkProps {
  tag: SerializedTag
  team: SerializedTeam
  draggable?: boolean
  intent?: TagLinkIntent
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  tabIndex?: number
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const TagLink = ({
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
}: TagLinkProps) => {
  return (
    <a
      href={getHref(tag, team, intent, query)}
      className={className}
      style={style}
      onClick={onClick}
      draggable={draggable}
      onFocus={onFocus}
      tabIndex={tabIndex}
      id={id}
    >
      {children}
    </a>
  )
}

export default TagLink

export function getHref(
  tag: SerializedTag,
  team: SerializedTeam,
  intent: TagLinkIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}/labels/${encodeURIComponent(
    tag.text
  )}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

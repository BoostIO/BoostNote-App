import React, { MouseEvent, useCallback } from 'react'
import querystring from 'querystring'
import { getTeamURL } from '../../../lib/utils/patterns'
import { SerializedTag } from '../../../interfaces/db/tag'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useRouter } from '../../../lib/router'

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
  const href = getTagHref(tag, team, intent, query)
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

export default TagLink

export function getTagHref(
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

export function useNavigateToTag() {
  const { push } = useRouter()

  return useCallback(
    (
      tag: SerializedTag,
      team: SerializedTeam,
      intent: TagLinkIntent,
      query?: any
    ) => {
      const href = getTagHref(tag, team, intent, query)
      push(href)
    },
    [push]
  )
}

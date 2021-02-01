import React, { useCallback, MouseEvent } from 'react'
import querystring from 'querystring'
import { getFolderURL, getTeamURL } from '../../../lib/utils/patterns'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../interfaces/db/folder'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useRouter } from '../../../lib/router'

export type FolderLinkIntent = 'index'

interface FolderLinkProps {
  folder: SerializedFolder | SerializedFolderWithBookmark
  draggable?: boolean
  team: SerializedTeam
  intent?: FolderLinkIntent
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const FolderLink = ({
  intent = 'index',
  folder,
  team,
  className,
  style,
  children,
  query,
  onClick,
  draggable = false,
  id,
  onFocus,
}: FolderLinkProps) => {
  const href = getFolderHref(folder, team, intent, query)
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
      onClick={onClick != null ? navigate : onClick}
      draggable={draggable}
      id={id}
      onFocus={onFocus}
    >
      {children}
    </a>
  )
}

export default FolderLink

export function getFolderHref(
  folder: SerializedFolder,
  team: SerializedTeam,
  intent: FolderLinkIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}${getFolderURL(folder)}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

export function useNavigateToFolder() {
  const { push } = useRouter()

  return useCallback(
    (
      folder: SerializedFolder,
      team: SerializedTeam,
      intent: FolderLinkIntent,
      query?: any
    ) => {
      const href = getFolderHref(folder, team, intent, query)
      push(href)
    },
    [push]
  )
}

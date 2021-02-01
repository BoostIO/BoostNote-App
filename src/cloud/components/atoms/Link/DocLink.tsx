import React, { useCallback, MouseEvent } from 'react'
import querystring from 'querystring'
import { getDocURL, getTeamURL } from '../../../lib/utils/patterns'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useRouter } from '../../../lib/router'

export type DocLinkIntent = 'index'

interface DocLinkProps {
  doc: SerializedDoc | SerializedDocWithBookmark
  team: SerializedTeam
  draggable?: boolean
  intent?: DocLinkIntent
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const DocLink = ({
  intent = 'index',
  doc,
  team,
  className,
  style,
  children,
  query,
  onClick,
  draggable = false,
  onFocus,
  id,
}: DocLinkProps) => {
  const { push } = useRouter()
  const href = getDocLinkHref(doc, team, intent, query)
  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      push(href)
    },
    [push, href]
  )

  return (
    <a
      className={className}
      style={style}
      onClick={onClick != null ? navigate : onClick}
      draggable={draggable}
      onFocus={onFocus}
      id={id}
    >
      {children}
    </a>
  )
}

export default DocLink

export function getDocLinkHref(
  doc: SerializedDoc,
  team: SerializedTeam,
  intent: DocLinkIntent,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}${getDocURL(doc)}`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  if (intent === 'index') {
    return `${basePathname}${queryPathName}`
  }
  return `${basePathname}/${intent}${queryPathName}`
}

export function useNavigateToDoc() {
  const { push } = useRouter()

  return useCallback(
    (
      doc: SerializedDoc,
      team: SerializedTeam,
      intent: DocLinkIntent,
      query?: any
    ) => {
      const href = getDocLinkHref(doc, team, intent, query)
      push(href)
    },
    [push]
  )
}

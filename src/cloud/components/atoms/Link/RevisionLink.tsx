import React, { useCallback, MouseEvent } from 'react'
import querystring from 'querystring'
import { getDocURL, getTeamURL } from '../../../lib/utils/patterns'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { useRouter } from '../../../lib/router'

interface RevisionLinkProps {
  doc: SerializedDoc
  team: SerializedTeam
  draggable?: boolean
  revision?: SerializedRevision
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  query?: any
  onClick?: () => void
  onFocus?: () => void
  id?: string
}

const RevisionLink = ({
  revision,
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
}: RevisionLinkProps) => {
  const href = getHref(doc, team, revision, query)
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
      id={id}
    >
      {children}
    </a>
  )
}

function getHref(
  doc: SerializedDoc,
  team: SerializedTeam,
  revision?: SerializedRevision,
  query?: any
) {
  const basePathname = `${getTeamURL(team)}${getDocURL(doc)}/revisions`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  return `${basePathname}/${
    revision != null ? revision.id : ''
  }${queryPathName}`
}

export default RevisionLink

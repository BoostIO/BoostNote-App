import React from 'react'
import querystring from 'querystring'
import { getDocURL, getTeamURL } from '../../../lib/utils/patterns'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedRevision } from '../../../interfaces/db/revision'

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
  return (
    <a
      href={getHref(doc, team, revision, query)}
      className={className}
      style={style}
      onClick={onClick}
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

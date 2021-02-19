import React, { FC } from 'react'
import querystring from 'querystring'
import Link from './Link'

export type AccountLinkIntent = 'delete'

interface AccountLinkProps {
  draggable?: boolean
  intent?: AccountLinkIntent
  className?: string
  style?: React.CSSProperties
  query?: any
  beforeNavigate?: () => void
}

const AccountLink: FC<AccountLinkProps> = ({
  intent = 'delete',
  className,
  style,
  children,
  query,
  draggable = false,
  beforeNavigate,
}) => {
  return (
    <Link
      href={getAccountHref(intent, query)}
      beforeNavigate={beforeNavigate}
      className={className}
      style={style}
      draggable={draggable}
    >
      {children}
    </Link>
  )
}

export default AccountLink

export function getAccountHref(intent: AccountLinkIntent, query?: any) {
  const basePathname = `account`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  return `/${basePathname}/${intent}${queryPathName}`
}

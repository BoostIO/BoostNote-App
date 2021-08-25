import React, { FC } from 'react'
import querystring from 'querystring'
import CloudLink from './CloudLink'

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
  children,
  query,
  draggable = false,
  beforeNavigate,
}) => {
  return (
    <CloudLink
      href={getAccountHref(intent, query)}
      beforeNavigate={beforeNavigate}
      className={className}
      draggable={draggable}
    >
      {children}
    </CloudLink>
  )
}

export default AccountLink

export function getAccountHref(intent: AccountLinkIntent, query?: any) {
  const basePathname = `account`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  return `/${basePathname}/${intent}${queryPathName}`
}

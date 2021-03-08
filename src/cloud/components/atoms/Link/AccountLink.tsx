import React, { FC } from 'react'
import querystring from 'querystring'
import Link from './Link'
import styled from '../../../lib/styled'

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
    <StyledLink>
      <Link
        href={getAccountHref(intent, query)}
        beforeNavigate={beforeNavigate}
        className={className}
        style={style}
        draggable={draggable}
      >
        {children}
      </Link>
    </StyledLink>
  )
}

export default AccountLink

const StyledLink = styled.span`
  a {
    color: ${({ theme }) => theme.primaryTextColor};

    &:hover,
    &:focus {
      text-decoration: none;
    }
  }
`

export function getAccountHref(intent: AccountLinkIntent, query?: any) {
  const basePathname = `account`
  const queryPathName = query != null ? `?${querystring.stringify(query)}` : ''
  return `/${basePathname}/${intent}${queryPathName}`
}

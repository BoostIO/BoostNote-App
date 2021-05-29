import React, { FC, useCallback, MouseEventHandler, FocusEvent } from 'react'
import { useRouter, Url } from '../../../lib/router'
import { stringifyUrl } from '../../../lib/utils/string'
import Link from '../../../../shared/components/atoms/Link'

export interface CloudLinkProps {
  href: Url
  id?: string
  className?: string
  tabIndex?: number
  draggable?: boolean
  beforeNavigate?: () => void | Promise<void>
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void
}

const CloudLink: FC<CloudLinkProps> = ({
  href,
  id,
  className,
  tabIndex,
  draggable,
  beforeNavigate,
  onFocus,
  children,
}) => {
  const { push } = useRouter()

  const onClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    async (event) => {
      event.preventDefault()
      if (beforeNavigate != null) {
        await beforeNavigate()
      }
      push(href)
    },
    [push, href, beforeNavigate]
  )

  return (
    <Link
      href={stringifyUrl(href)}
      onClick={onClick}
      onFocus={onFocus}
      id={id}
      className={className}
      tabIndex={tabIndex}
      draggable={draggable}
    >
      {children}
    </Link>
  )
}

export default CloudLink

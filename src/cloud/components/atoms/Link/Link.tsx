import React, {
  FC,
  useCallback,
  MouseEventHandler,
  CSSProperties,
  FocusEvent,
} from 'react'
import { useRouter, Url } from '../../../lib/router'
import { stringifyUrl } from '../../../lib/utils/string'

export interface LinkProps {
  href: Url
  id?: string
  className?: string
  tabIndex?: number
  draggable?: boolean
  style?: CSSProperties
  beforeNavigate?: () => void | Promise<void>
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void
}

const Link: FC<LinkProps> = ({
  href,
  id,
  className,
  tabIndex,
  draggable,
  style,
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
    <a
      href={stringifyUrl(href)}
      onClick={onClick}
      onFocus={onFocus}
      id={id}
      className={className}
      tabIndex={tabIndex}
      draggable={draggable}
      style={style}
    >
      {children}
    </a>
  )
}

export default Link

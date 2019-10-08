import React, { useCallback, FC, CSSProperties } from 'react'
import { useRouter } from './store'

export interface LinkProps {
  href?: string
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

export const Link: FC<LinkProps> = ({ children, href, className, style }) => {
  const router = useRouter()

  const push = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (href != null) {
        router.push(href)
      }
    },
    [href, router]
  )

  return (
    <a onClick={push} href={href} className={className} style={style}>
      {children}
    </a>
  )
}

import React, { useCallback, FC } from 'react'
import { useRouter } from './store'

export interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const Link: FC<LinkProps> = ({ children, href, className }) => {
  const router = useRouter()

  const push = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      router.push(href)
    },
    [href, router]
  )

  return (
    <a onClick={push} href={href} className={className}>
      {children}
    </a>
  )
}

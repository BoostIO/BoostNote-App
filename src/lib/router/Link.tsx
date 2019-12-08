import React, {
  useCallback,
  FC,
  CSSProperties,
  MouseEventHandler,
  FocusEventHandler,
  DragEventHandler
} from 'react'
import { useRouter } from './store'

export interface LinkProps {
  href?: string
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  onContextMenu?: MouseEventHandler
  onFocus?: FocusEventHandler
  draggable?: boolean
  onDragStart?: DragEventHandler
  onDrop?: DragEventHandler
  onDragOver?: DragEventHandler
}

export const Link: FC<LinkProps> = ({
  children,
  href,
  className,
  style,
  onContextMenu,
  onFocus,
  onDragStart,
  onDragOver,
  onDrop
}) => {
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
    <a
      onClick={push}
      onContextMenu={onContextMenu}
      href={href}
      className={className}
      style={style}
      onFocus={onFocus}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </a>
  )
}

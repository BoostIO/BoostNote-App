import { Emoji } from 'emoji-mart'
import React, { useRef } from 'react'
import styled from '../../../../../lib/v2/styled'
import Icon from '../../../atoms/Icon'
import cc from 'classcat'

export interface TopbarBreadcrumbItemProps {
  id: string
  className?: string
  label: string
  defaultIcon?: string
  emoji?: string
  active?: boolean
  href: string
  controls: { label: string; onClick: () => void }[]
  onDoubleClick: () => void
  onClick: (props: { bottom: number; left: number }) => void
  onContextMenu: React.MouseEventHandler
}

const TopbarBreadcrumb = ({
  id,
  className,
  label,
  defaultIcon,
  emoji,
  active,
  href,
  onDoubleClick,
  onClick,
  onContextMenu,
}: TopbarBreadcrumbItemProps) => {
  const timeoutRef = useRef<number | null>(null)

  const handleClickOrDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      onDoubleClick()
      return
    }

    const { bottom, left } = event.currentTarget.getBoundingClientRect()
    timeoutRef.current = window.setTimeout(() => {
      onClick({ bottom, left })
      timeoutRef.current = null
    }, 200)
  }

  return (
    <Container
      id={id}
      className={cc([
        'topbar__breadcrumb',
        active && 'topbar__breadcrumb__active',
        className,
      ])}
      onContextMenu={onContextMenu}
      href={href}
      onClick={handleClickOrDoubleClick}
    >
      {emoji != null ? (
        <Emoji emoji={emoji} set='apple' size={16} />
      ) : defaultIcon != null ? (
        <Icon path={defaultIcon} size={16} />
      ) : null}
      {label}
    </Container>
  )
}

const Container = styled.a`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex: 0 1 auto;
  text-decoration: none;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  padding: 2px ${({ theme }) => theme.sizes.spaces.xsm}px;

  &.topbar__breadcrumb__active {
  }
`

export default TopbarBreadcrumb

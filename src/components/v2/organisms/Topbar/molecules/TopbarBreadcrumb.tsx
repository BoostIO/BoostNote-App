import { Emoji } from 'emoji-mart'
import React, { useRef } from 'react'
import styled from '../../../../../shared/lib/styled'
import Icon from '../../../../../shared/components/atoms/Icon'
import cc from 'classcat'
import { textOverflow } from '../../../../../lib/styled/styleFunctions'

export interface TopbarBreadcrumbItemProps {
  id: string
  className?: string
  label: string
  defaultIcon?: string
  emoji?: string
  active?: boolean
  href: string
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
      {(emoji != null || defaultIcon != null) && (
        <div className='topbar__breadcrumb__icon'>
          {emoji != null ? (
            <Emoji emoji={emoji} set='apple' size={16} />
          ) : defaultIcon != null ? (
            <Icon path={defaultIcon} size={16} />
          ) : null}
        </div>
      )}
      <span className='topbar__breadcrumb__label'>{label}</span>
    </Container>
  )
}

const Container = styled.a`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex: 0 0 auto;
  text-decoration: none;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  padding: 2px ${({ theme }) => theme.sizes.spaces.xsm}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  border-radius: ${({ theme }) => theme.borders.radius}px;
  white-space: nowrap;
  background-color: transparent;
  cursor: pointer;
  text-decoration: none !important;
  min-width: 20px;
  max-width: 160px;
  overflow: hidden;

  .topbar__breadcrumb__label {
    ${textOverflow}
  }

  &.topbar__breadcrumb__active {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .topbar__breadcrumb__icon {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`

export default TopbarBreadcrumb

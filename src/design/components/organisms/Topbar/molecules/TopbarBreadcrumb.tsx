import { Emoji } from 'emoji-mart'
import React, { useRef } from 'react'
import styled from '../../../../lib/styled'
import Icon from '../../../atoms/Icon'
import cc from 'classcat'
import WithTooltip from '../../../atoms/WithTooltip'
import { textOverflow } from '../../../../lib/styled/styleFunctions'

export interface TopbarBreadcrumbItemProps {
  id: string
  minimized?: boolean
  className?: string
  label: string
  defaultIcon?: string
  emoji?: string
  active?: boolean
  href: string
  onDoubleClick: React.MouseEventHandler
  onClick: (props: { bottom: number; left: number }) => void
  onContextMenu: React.MouseEventHandler
}

const TopbarBreadcrumb = ({
  id,
  className,
  label,
  minimized,
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
      onDoubleClick(event)
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
        active && 'topbar__breadcrumb--active',
        minimized && 'topbar__breadcrumb--minimized',
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

const WrappedTopbarBreadcrumb = ({
  minimized,
  ...props
}: TopbarBreadcrumbItemProps) => {
  if (minimized) {
    return (
      <WithTooltip tooltip={props.label} side='bottom'>
        <TopbarBreadcrumb {...props} minimized={minimized} />
      </WithTooltip>
    )
  }

  return <TopbarBreadcrumb {...props} minimized={minimized} />
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
  overflow: hidden;

  .topbar__breadcrumb__label {
    ${textOverflow}
  }

  &.topbar__breadcrumb--active {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &.topbar__breadcrumb--minimized {
    max-width: 160px;
  }

  .topbar__breadcrumb__icon {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    svg {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`

export default WrappedTopbarBreadcrumb

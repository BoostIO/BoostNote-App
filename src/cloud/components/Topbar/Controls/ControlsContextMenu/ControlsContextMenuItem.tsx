import React from 'react'
import { menuHeight } from '../../../../../design/lib/stores/contextMenu'
import styled from '../../../../../design/lib/styled'

interface ContextMenuItemProps {
  label: string | React.ReactNode
  tooltip?: string
  disabled?: boolean
  id?: string
  onClick?: () => void
  className?: string
}

const ContextMenuItem = ({
  label,
  disabled = false,
  onClick,
  id,
  tooltip,
  className,
}: ContextMenuItemProps) => {
  if (tooltip != null) {
    return (
      <StyledContextMenuItem
        disabled={disabled}
        onClick={onClick}
        id={id}
        className={className}
      >
        <span>{label}</span>
        <span className='tooltip-text'>{tooltip}</span>
      </StyledContextMenuItem>
    )
  }

  return (
    <StyledContextMenuItem
      disabled={disabled}
      onClick={onClick}
      id={id}
      className={className}
    >
      {label}
    </StyledContextMenuItem>
  )
}

const StyledContextMenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${menuHeight}px;
  padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
  background-color: transparent;
  border: none;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  text-align: left;
  transition: 200ms color;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.subtle};

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.subtle};
      background-color: transparent;
      cursor: not-allowed;
    }
  }

  span.tooltip-text {
    width: auto;
    min-width: 30px;
    height: auto;
    margin-left: ${({ theme }) => theme.sizes.spaces.md}px;
    padding: 2px 5px;
    border: 1px solid ${({ theme }) => theme.colors.background.tertiary};
    border-radius: 2px;
    color: ${({ theme }) => theme.colors.text.subtle};
    line-height: ${({ theme }) => theme.sizes.fonts.sm}px;
    text-align: center;
  }
`

export default ContextMenuItem

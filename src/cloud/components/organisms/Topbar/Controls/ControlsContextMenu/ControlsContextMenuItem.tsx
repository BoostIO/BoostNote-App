import React from 'react'
import styled from '../../../../../lib/styled'
import {
  baseIconStyle,
  tooltipText,
} from '../../../../../lib/styled/styleFunctions'

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
        <div>
          <span>{label}</span>
          <span className='tooltip-text'>{tooltip}</span>
        </div>
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
  ${baseIconStyle}
  display: block;
  width: 100%;
  height: 35px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  background: none;
  color: ${({ theme }) => theme.baseTextColor};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  line-height: ${({ theme }) => theme.fontSizes.small}px;
  text-align: left;
  white-space: nowrap;

  &.bigger-height {
    height: 40px;
  }

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &:disabled {
    color: ${({ theme }) => theme.subtleTextColor};

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.subtleTextColor} !important;
      background-color: transparent;
      cursor: not-allowed;
    }
  }

  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  span.tooltip-text {
    ${tooltipText}
    width: auto;
    min-width: 30px;
    padding: 2px 5px;
    position: relative;
    right: initial;
    height: auto;
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    line-height: ${({ theme }) => theme.fontSizes.small}px;
  }
`

export default ContextMenuItem

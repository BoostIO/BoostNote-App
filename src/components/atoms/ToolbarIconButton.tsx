import React from 'react'
import styled from '../../lib/styled'
import { iconColor } from '../../lib/styled/styleFunctions'

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  font-size: 16px;
  outline: none;
  border: none;
  ${iconColor}
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
`

interface ToolbarButtonProps {
  icon: React.ReactNode
  active?: boolean
  className?: string
  onClick: React.MouseEventHandler
}

const ToolbarButton = ({
  icon,
  onClick,
  active = false,
  className
}: ToolbarButtonProps) => (
  <StyledButton onClick={onClick} active={active} className={className}>
    {icon}
  </StyledButton>
)

export default ToolbarButton

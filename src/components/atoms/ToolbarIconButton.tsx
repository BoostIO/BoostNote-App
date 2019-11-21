import React from 'react'
import Icon from './Icon'
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
  active?: boolean
  path: string
  className?: string
  onClick: React.MouseEventHandler
}

const ToolbarButton = ({
  path,
  onClick,
  active = false,
  className
}: ToolbarButtonProps) => (
  <StyledButton onClick={onClick} active={active} className={className}>
    <Icon path={path} />
  </StyledButton>
)

export default ToolbarButton

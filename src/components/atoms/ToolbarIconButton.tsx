import React from 'react'
import Icon from './Icon'
import styled from '../../lib/styled'

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  width: 30px;
  height: 30px;
  font-size: 16px;
  ${({ active, theme }) => active && `color: ${theme.colors.active};`}
`

interface ToolbarButtonProps {
  active?: boolean
  path: string
  onClick: React.MouseEventHandler
}

const ToolbarButton = ({
  path,
  onClick,
  active = false
}: ToolbarButtonProps) => (
  <StyledButton onClick={onClick} active={active}>
    <Icon path={path} />
  </StyledButton>
)

export default ToolbarButton

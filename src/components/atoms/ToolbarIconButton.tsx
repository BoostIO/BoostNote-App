import React from 'react'
import Icon from './Icon'
import styled from '../../lib/styled'

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  border: solid 1px ${({ theme }) => theme.colors.border};
  width: 38px;
  height: 22px;
  box-sizing: border-box;
  font-size: 16px;
  margin: 0 3px;
  border-radius: 2px;
  ${({ active, theme }) => active && `color: ${theme.colors.active};`}
  outline: none;
  &:focus,
  &:active {
    background-color: ${({ theme }) => theme.colors.alternativeBackground};
  }
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

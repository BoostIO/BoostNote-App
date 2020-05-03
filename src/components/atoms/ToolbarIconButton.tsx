import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'

const ToolbarButtonContainer = styled.button`
  height: 32px;
  box-sizing: border-box;
  font-size: 18px;
  outline: none;

  background-color: transparent;
  border: none;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

interface ToolbarButtonProps {
  iconPath: string
  active?: boolean
  onClick: React.MouseEventHandler
}

const ToolbarButton = ({
  iconPath,
  onClick,
  active = false,
}: ToolbarButtonProps) => (
  <ToolbarButtonContainer onClick={onClick} className={active ? 'active' : ''}>
    <Icon path={iconPath} />
  </ToolbarButtonContainer>
)

export default ToolbarButton

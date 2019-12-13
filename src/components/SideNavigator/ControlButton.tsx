import React from 'react'
import styled from '../../lib/styled'
import {
  sideBarTextColor,
  sideBarSecondaryTextColor
} from '../../lib/styled/styleFunctions'

const StyledButton = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background-color: transparent;
  border-radius: 2px;
  top: 2px;
  font-size: 20px;
  cursor: pointer;
  ${sideBarTextColor}
  ${sideBarSecondaryTextColor}
  &:hover, &:active, &:focus {
    box-shadow: none;
  }
  svg {
    vertical-align: middle;
  }
`

interface ControlButtonProps {
  icon: React.ReactNode
  onClick?: (event: React.MouseEvent) => void
}

const ControlButton = ({ icon, onClick }: ControlButtonProps) => {
  return <StyledButton onClick={onClick}>{icon}</StyledButton>
}

export default ControlButton

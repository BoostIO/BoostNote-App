import React from 'react'
import styled from '../../lib/styled'
import {
  sideBarTextColor,
  sideBarSecondaryTextColor
} from '../../lib/styled/styleFunctions'

const StyledButton = styled.button`
  width: 30px;
  padding: 0;
  border: none;
  background-color: transparent;
  border-radius: 2px;
  font-size: 20px;
  line-height: 20px;
  cursor: pointer;
  vertical-align: middle;
  ${sideBarSecondaryTextColor}
  &:hover, &:active, &:focus {
    box-shadow: none;
    ${sideBarTextColor}
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

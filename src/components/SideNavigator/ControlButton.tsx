import React from 'react'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { uiTextColor } from '../../lib/styled/styleFunctions'

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
  ${uiTextColor}
  &:focus {
    box-shadow: none;
  }
`

interface ControlButtonProps {
  iconPath: string
  onClick?: (event: React.MouseEvent) => void
}

const ControlButton = ({ iconPath, onClick }: ControlButtonProps) => {
  return (
    <StyledButton onClick={onClick}>
      <Icon path={iconPath} />
    </StyledButton>
  )
}

export default ControlButton

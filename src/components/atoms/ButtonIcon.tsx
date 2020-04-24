import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'

const StyledButtonIcon = styled.button`
  color: currentColor;
  background-color: transparent;
  border: none;
  cursor: pointer;

  svg {
    margin-top: 2px;
    vertical-align: top;
  }
`

interface ButtonIconProps {
  iconPath: string
  className?: string
  onClick?: () => void
}

const ButtonIcon = ({ iconPath, className, onClick }: ButtonIconProps) => (
  <StyledButtonIcon onClick={onClick} className={className}>
    <Icon path={iconPath} />
  </StyledButtonIcon>
)

export default ButtonIcon

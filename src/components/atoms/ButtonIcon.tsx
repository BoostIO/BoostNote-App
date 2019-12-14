import React from 'react'
import styled from '../../lib/styled'

const StyledButtonIcon = styled.button<{ active: boolean }>`
  color: currentColor;
  background-color: transparent;
  border: none;
  cursor: pointer;

  svg {
    vertical-align: middle;
  }
`

interface ButtonIconProps {
  icon: React.ReactNode
  className?: string
  onClick?: () => void
}

const ButtonIcon = ({ icon, className, onClick }: ButtonIconProps) => (
  <StyledButtonIcon onClick={onClick} className={className}>
    {icon}
  </StyledButtonIcon>
)

export default ButtonIcon

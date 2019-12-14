import React from 'react'
import styled from '../../lib/styled'

const StyledButton = styled.button<{ active: boolean }>`
  color: currentColor;
  background-color: transparent;
  border: none;
  cursor: pointer;

  svg {
    vertical-align: middle;
  }
`

interface IconProps {
  icon: React.ReactNode
  className?: string
}

const Icon = ({ icon, className }: IconProps) => (
  <StyledButton className={className} size='1em'>
    {icon}
  </StyledButton>
)

export default Icon

import React from 'react'
import styled from '../../../lib/styled'
import Icon from '../../../components/atoms/Icon'

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  width: 29px;
  padding: 0;
  border: none;
  background-color: transparent;
  font-size: 18px;
  cursor: pointer;
  color: ${({ theme }) => theme.navButtonColor};

  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

interface ControlButtonProps {
  iconPath: string
  onClick?: (event: React.MouseEvent) => void
  spin?: boolean
  active?: boolean
}

const ControlButton = ({
  iconPath,
  spin,
  onClick,
  active = false,
}: ControlButtonProps) => {
  return (
    <StyledButton onClick={onClick} className={active ? 'active' : ''}>
      <Icon path={iconPath} spin={spin} />
    </StyledButton>
  )
}

export default ControlButton

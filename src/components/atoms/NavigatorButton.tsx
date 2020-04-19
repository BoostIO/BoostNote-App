import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'

const ButtonContainer = styled.button`
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: transparent;
  border-radius: 50%;
  border: none;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.sideNavButtonColor};
  &:hover {
    color: ${({ theme }) => theme.sideNavButtonHoverColor};
  }

  &:active,
  .active {
    color: ${({ theme }) => theme.sideNavButtonActiveColor};
  }
`

interface NavigatorButtonProps {
  active?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>
  iconPath: string
}

const NavigatorButton = ({
  active,
  onClick,
  onContextMenu,
  iconPath,
}: NavigatorButtonProps) => {
  return (
    <ButtonContainer
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={active ? 'active' : ''}
    >
      <Icon path={iconPath} />
    </ButtonContainer>
  )
}

export default NavigatorButton

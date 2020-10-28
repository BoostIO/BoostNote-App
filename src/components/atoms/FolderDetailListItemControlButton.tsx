import React, { MouseEventHandler } from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'

interface FolderDetailListItemControlButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  iconPath: string
  title?: string
  active?: boolean
}

const FolderDetailListItemControlButton = ({
  onClick,
  title,
  iconPath,
  active = false,
}: FolderDetailListItemControlButtonProps) => {
  return (
    <Container
      className={active ? 'active' : ''}
      onClick={onClick}
      title={title}
    >
      <Icon path={iconPath} />
    </Container>
  )
}

export default FolderDetailListItemControlButton

const Container = styled.button`
  width: 24px;
  height: 24px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: transparent;
  border-radius: 50%;
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

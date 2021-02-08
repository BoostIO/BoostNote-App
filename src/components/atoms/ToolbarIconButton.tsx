import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'
import { flexCenter } from '../../lib/styled/styleFunctions'

const Container = styled.button`
  height: 32px;
  width: 32px;
  box-sizing: border-box;
  font-size: 18px;
  outline: none;
  padding: 0 5px;

  background-color: transparent;
  ${flexCenter}

  border: none;
  border-radius: 3px;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &:hover,
  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

interface ToolbarButtonProps {
  iconPath: string
  active?: boolean
  title?: string
  onContextMenu?: React.MouseEventHandler
  onClick: React.MouseEventHandler
}

const ToolbarIconButton = React.forwardRef(
  (
    {
      iconPath,
      onClick,
      onContextMenu,
      active = false,
      title,
    }: ToolbarButtonProps,
    ref
  ) => (
    <Container
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={active ? 'active' : ''}
      ref={ref}
      title={title}
    >
      <Icon size={18} path={iconPath} />
    </Container>
  )
)

export default ToolbarIconButton

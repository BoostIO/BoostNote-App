import React from 'react'
import styled from '../../../lib/styled'

const Button = styled.button`
  height: 44px;
  width: 44px;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface TopBarButtonProps {
  onClick?: React.MouseEventHandler
  children: React.ReactNode
}

const TopBarButton = ({ onClick, children }: TopBarButtonProps) => (
  <Button onClick={onClick}>{children}</Button>
)

export default TopBarButton

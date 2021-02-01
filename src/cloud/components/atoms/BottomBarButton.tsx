import React, { MouseEventHandler, FC } from 'react'
import styled from '../../lib/styled'

interface BottomBarButtonProps {
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

const BottomBarButton: FC<BottomBarButtonProps> = ({
  className,
  onClick,
  children,
}) => {
  return (
    <Container className={className} onClick={onClick}>
      {children}
    </Container>
  )
}

export default BottomBarButton

const Container = styled.button`
  background-color: transparent;
  height: 100%;
  border: none;
  color: ${({ theme }) => theme.baseTextColor};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }
`

import React, { MouseEventHandler, FC } from 'react'
import { flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../shared/lib/styled'
import { borderLeft } from '../../shared/lib/styled/styleFunctions'

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
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  ${flexCenter};
  padding: 0 5px;
  ${borderLeft};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`

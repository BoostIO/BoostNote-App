import React from 'react'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'

interface PastilleProps {
  variant: 'danger'
  size: number
}

const Pastille: AppComponent<PastilleProps> = ({
  variant,
  size,
  className,
  children,
}) => (
  <Container
    className={cc(['pastille', `pastille--${variant}`, className])}
    size={size}
  >
    {children}
  </Container>
)

const Container = styled.div<{ size: number }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  text-align: center;
  font-size: 10px;
  border-radius: 50%;

  &.pastille--danger {
    color: #fff;
    background-color: #cd4400;
  }
`

export default Pastille

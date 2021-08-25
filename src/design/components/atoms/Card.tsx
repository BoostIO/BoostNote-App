import React from 'react'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'

interface CardProps {
  title?: string
  maxWidth?: 1000 | 480
}

const Card: AppComponent<CardProps> = ({
  title,
  maxWidth,
  className,
  children,
}) => {
  return (
    <CardContainer maxWidth={maxWidth} className={cc(['card', className])}>
      {title != null && <h1>{title}</h1>}
      {children}
    </CardContainer>
  )
}

const CardContainer = styled.div<{ maxWidth?: number }>`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.colors.shadow};
  width: 100%;
  padding: ${({ theme }) => theme.sizes.spaces.xl}px
    ${({ theme }) => theme.sizes.spaces.l}px;
  max-width: 96%;
  margin: 0 auto;
  max-height: 96%;
  overflow: hidden auto;

  border-radius: 5px;
  ${({ maxWidth = 1000 }) => `width: ${maxWidth}px;`}

  .card__scroller {
    max-height: 100%;
  }

  h1,
  p {
    text-align: center;
  }
`

export default Card

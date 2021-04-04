import React from 'react'
import cc from 'classcat'
import styled from '../../../lib/v2/styled'

interface BadgeProps {
  variant?: 'bordered'
  className?: string
}

const Badge = ({
  variant = 'bordered',
  className,
  children,
}: React.PropsWithChildren<BadgeProps>) => (
  <Container className={cc(['badge', `badge--${variant}`, className])}>
    {children}
  </Container>
)

const Container = styled.div`
  display: inline-block;
  text-decoration: none;
  position: relative;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  border-radius: 10px;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;

  &.badge--bordered {
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.text.subtle};
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default Badge

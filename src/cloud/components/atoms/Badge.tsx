import React from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'

interface BadgeProps {
  label: React.ReactNode
  variant?: 'danger' | 'warning' | 'info'
  className?: string
}

const Badge = ({ label, variant, className }: BadgeProps) => (
  <StyledBadge className={cc(['badge', `badge-${variant}`, className])}>
    {label}
  </StyledBadge>
)

const StyledBadge = styled.div`
  display: inline-block;
  text-decoration: none;
  position: relative;
  padding: ${({ theme }) => theme.space.xxsmall}px
    ${({ theme }) => theme.space.xsmall}px;
  border-radius: 3px;
  font-size: ${({ theme }) => theme.fontSizes.small}px;

  &.badge-danger {
    background-color: ${({ theme }) => theme.dangerBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
  }

  &.badge-warning {
    background-color: ${({ theme }) => theme.warningBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
  }

  &.badge-info {
    background-color: ${({ theme }) => theme.infoBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
  }
`

export default Badge

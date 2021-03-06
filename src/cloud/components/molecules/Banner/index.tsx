import React, { CSSProperties } from 'react'
import cc from 'classcat'
import styled from '../../../lib/styled'

interface BannerProps {
  children: React.ReactNode | string
  variant?: 'danger' | 'info' | 'warning'
  className?: string
  style?: CSSProperties
}

const Banner = ({
  children,
  className,
  style,
  variant = 'danger',
}: BannerProps) => {
  return (
    <StyledBanner
      className={cc(['banner-top', `banner-${variant}`, className])}
      style={style}
    >
      {children}
    </StyledBanner>
  )
}

const StyledBanner = styled.div`
  width: 100%;
  position: relative;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  height: auto;
  min-height: ${({ theme }) => theme.topHeaderHeight}px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  z-index: 1;

  p {
    margin: 0px;
  }

  &.center {
    justify-content: center;
  }

  &.banner-danger {
    color: #61050d;
    background-color: #f7d9dc;
    border-color: #f3c6ca;
    button {
      background-color: #02a47e !important;
      color: #fff !important;
    }
  }
`

export default Banner

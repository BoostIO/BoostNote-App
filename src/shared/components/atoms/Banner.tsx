import React from 'react'
import { AppComponent } from '../../lib/types'
import Icon from './Icon'
import cc from 'classcat'
import styled from '../../lib/styled'

interface BannerProps {
  variant: 'danger' | 'warning' | 'info'
  iconPath?: string
}

const Banner: AppComponent<BannerProps> = ({
  variant,
  iconPath,
  children,
  className,
}) => (
  <Container className={cc(['banner', `banner--${variant}`, className])}>
    {iconPath != null && (
      <Icon className='banner__icon' path={iconPath} size={16} />
    )}
    <div className='banner__content'>{children}</div>
  </Container>
)

const Container = styled.div`
  display: flex;
  width: 100%;
  flex: 1 1 auto;
  overflow: hidden;
  white-space: none;
  padding: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.md}px;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;

  .banner__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  &.banner--danger {
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    color: ${({ theme }) => theme.colors.variants.danger.text};
  }

  &.banner--warning {
    background-color: ${({ theme }) => theme.colors.variants.warning.base};
    color: ${({ theme }) => theme.colors.variants.warning.text};
  }

  &.banner--info {
    background-color: ${({ theme }) => theme.colors.variants.info.base};
    color: ${({ theme }) => theme.colors.variants.info.text};
  }
`

export default Banner

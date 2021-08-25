import React, { CSSProperties } from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'

interface ColoredBlockProps {
  variant: 'danger' | 'warning' | 'success' | 'info' | 'secondary'
  style?: CSSProperties
}

const ColoredBlock: AppComponent<ColoredBlockProps> = ({
  className,
  variant,
  style,
  children,
}) => (
  <StyledColoredBlock
    className={cc(['colored-block', `colored-block--${variant}`, className])}
    style={style}
  >
    {children}
  </StyledColoredBlock>
)

const StyledColoredBlock = styled.div`
  position: relative;
  width: 100%;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px
    ${({ theme }) => theme.sizes.spaces.df}px;
  border-radius: 3px;

  > ul,
  > ol,
  > p {
    margin: 0;
  }

  &.colored-block--info {
    background-color: ${({ theme }) => theme.colors.variants.info.base};
    color: ${({ theme }) => theme.colors.variants.info.text};
  }

  &.colored-block--danger {
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    color: ${({ theme }) => theme.colors.variants.danger.text};
  }

  &.colored-block--warning {
    background-color: ${({ theme }) => theme.colors.variants.warning.base};
    color: ${({ theme }) => theme.colors.variants.warning.text};
  }

  &.colored-block--success {
    background-color: ${({ theme }) => theme.colors.variants.success.base};
    color: ${({ theme }) => theme.colors.variants.success.text};
  }

  &.colored-block--secondary {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.variants.secondary.text};
  }
`

export default ColoredBlock

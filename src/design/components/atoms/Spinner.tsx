import React from 'react'
import { keyframes } from 'styled-components'
import styled from '../../lib/styled'
import cc from 'classcat'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

interface SpinnerProps {
  variant?: 'primary' | 'subtle' | 'secondary' | 'warning'
  size?: number
  style?: React.CSSProperties
  className?: string
}

const Spinner = ({
  variant = 'primary',
  size,
  className,
  style,
}: SpinnerProps) => {
  return (
    <SpinnerContainer
      className={cc([`spinner--${variant}`, className])}
      style={size != null ? { width: size, height: size, ...style } : style}
    />
  )
}

const SpinnerContainer = styled.div<{ size?: number }>`
  border-style: solid;
  border-right-color: transparent !important;
  border-width: 2px;
  width: 1em;
  height: 1em;
  display: inline-block;
  border-radius: 50%;
  animation: ${rotate} 0.75s linear infinite;

  &.spinner--primary {
    border-color: ${({ theme }) => theme.colors.variants.primary.base};
  }

  &.spinner--subtle {
    border-color: ${({ theme }) => theme.colors.text.subtle};
  }

  &.spinner--secondary {
    border-color: ${({ theme }) => theme.colors.variants.secondary.base};
  }

  &.spinner--warning {
    border-color: ${({ theme }) => theme.colors.variants.warning.base};
  }
`

export default Spinner

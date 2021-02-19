import React, { CSSProperties } from 'react'
import styled from '../../../lib/styled'
import {
  primaryButtonStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
  transparentButtonStyle,
  baseButtonStyle,
  warningButtonStyle,
  infoButtonStyle,
  lpPrimaryButtonStyle,
  blueButtonStyle,
  inverseSecondaryButtonStyle,
} from '../../../lib/styled/styleFunctions'
import cc from 'classcat'

export interface PrimaryButtonProps {
  disabled?: boolean
  active?: boolean
  variant?:
    | 'primary'
    | 'lp-primary'
    | 'secondary'
    | 'inverse-secondary'
    | 'danger'
    | 'warning'
    | 'info'
    | 'transparent'
    | 'blue'
  type?: 'submit' | 'reset' | 'button'
  onClick?: (event: React.MouseEvent) => void
  className?: string
  style?: CSSProperties
  tabIndex?: number
}

const CustomButton = ({
  type = 'button',
  variant = 'primary',
  active,
  onClick,
  className,
  style,
  disabled,
  children,
  tabIndex = 0,
}: React.PropsWithChildren<PrimaryButtonProps>) => {
  return (
    <CustomButtonStyle
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={cc([`btn-${variant}`, active && 'active', className])}
      style={style}
      tabIndex={tabIndex}
    >
      {children}
    </CustomButtonStyle>
  )
}

export default CustomButton

const CustomButtonStyle = styled.button`
  display: inline-block;
  text-decoration: none;
  position: relative;

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  svg.icon {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    color: currentColor;
    transform: none !important;
    line-height: inherit !important;
  }

  &.btn-primary {
    ${baseButtonStyle}
    ${primaryButtonStyle}
  }

  &.btn-lp-primary {
    ${baseButtonStyle}
    ${lpPrimaryButtonStyle}
  }

  &.btn-secondary {
    ${baseButtonStyle}
    ${secondaryButtonStyle}
  }

  &.btn-inverse-secondary {
    ${baseButtonStyle}
    ${inverseSecondaryButtonStyle}
  }

  &.btn-danger {
    ${baseButtonStyle}
    ${dangerButtonStyle}
  }

  &.btn-warning {
    ${baseButtonStyle}
    ${warningButtonStyle}
  }

  &.btn-info {
    ${baseButtonStyle}
    ${infoButtonStyle}
  }

  &.btn-transparent {
    ${baseButtonStyle}
    ${transparentButtonStyle}
  }

  &.btn-blue {
    ${baseButtonStyle}
    ${blueButtonStyle}
  }

  &.size-l {
    min-width: 130px;
  }

  &.rounded {
    border-radius: 25px;
  }

  &.mr-2 {
    margin-right: ${({ theme }) => theme.space.small}px;
  }
`

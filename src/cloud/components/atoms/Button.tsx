import React, {
  MouseEventHandler,
  FocusEventHandler,
  DragEventHandler,
  PropsWithChildren,
} from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import Icon from './Icon'
import {
  UnroundedParamTypes,
  createUnroundedStyle,
} from '../../lib/styled/unrounded'

const { getUnroundedClassNames, unroundedStyle } = createUnroundedStyle(
  'button'
)

export interface ButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'info'
    | 'link'
    | 'transparent'
    | 'nav'
    | 'outline-primary'
    | 'outline-secondary'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  iconPath?: string
  unrounded?: UnroundedParamTypes

  type?: string
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  title?: string
  align?: 'left' | 'center' | 'right'
  tabIndex?: number
  id?: string

  onClick?: MouseEventHandler<HTMLButtonElement>
  onMouseUp?: MouseEventHandler<HTMLButtonElement>
  onMouseDown?: MouseEventHandler<HTMLButtonElement>
  onMouseMove?: MouseEventHandler<HTMLButtonElement>
  onMouseOver?: MouseEventHandler<HTMLButtonElement>
  onMouseOut?: MouseEventHandler<HTMLButtonElement>
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>
  onDoubleClick?: MouseEventHandler<HTMLButtonElement>
  onContextMenu?: MouseEventHandler<HTMLButtonElement>
  onFocus?: FocusEventHandler<HTMLButtonElement>
  onDrag?: DragEventHandler<HTMLButtonElement>
  onDragStart?: DragEventHandler<HTMLButtonElement>
  onDragEnd?: DragEventHandler<HTMLButtonElement>
  onDrop?: DragEventHandler<HTMLButtonElement>
}

const Button = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      block,
      iconPath,
      unrounded = false,
      type,
      title,
      disabled,
      className,
      style,
      tabIndex,
      align = 'center',
      id,
      onClick,
      onMouseUp,
      onMouseDown,
      onMouseMove,
      onMouseOver,
      onMouseOut,
      onMouseEnter,
      onMouseLeave,
      onDoubleClick,
      onContextMenu,
      onFocus,
      onDrag,
      onDragStart,
      onDragEnd,
      onDrop,
    },
    ref
  ) => {
    return (
      <StyledButton
        type={type}
        className={cc([
          className,
          `button--variant-${variant}`,
          size && `button--size-${size}`,
          block && 'block',
          ...getUnroundedClassNames(unrounded),
          align !== 'center' && `button--align-${align}`,
        ])}
        id={id}
        style={style}
        title={title}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={onClick}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onFocus={onFocus}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        ref={ref}
      >
        {iconPath != null && <Icon className='button__icon' path={iconPath} />}
        {children != null && <div className='button__label'>{children}</div>}
      </StyledButton>
    )
  }
)

export default Button

const StyledButton = styled.button`
  padding: 0 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  color: ${({ theme }) => theme.whiteTextColor};
  height: 36px;
  outline: none;
  border-radius: 4px;
  border-color: transparent;
  border-width: 1px;
  border-style: solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: Arial;
  box-sizing: border-box;

  &.button--align-left {
    justify-content: left;
  }
  &.button--align-right {
    justify-content: right;
  }

  & + * {
    margin-left: 5px;
    &.block {
      margin-left: 0;
    }
  }

  & > .button__icon + .button__label {
    margin-left: 4px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  ${unroundedStyle}

  &.button--variant-nav {
    color: ${({ theme }) => theme.baseTextColor};
    background-color: transparent;
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      color: ${({ theme }) => theme.whiteTextColor};
    }
    &:focus {
      box-shadow: none;
    }
    &:focus-visible {
      box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.focusShadowColor};
    }
  }

  &.button--variant-transparent {
    background-color: transparent;
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      color: ${({ theme }) => theme.primaryTextColor};
    }
    &:focus {
      box-shadow: none;
    }
    &:focus-visible {
      box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.focusShadowColor};
    }
  }

  &.button--variant-outline-primary {
    border-color: ${({ theme }) => theme.primaryBackgroundColor};
    color: ${({ theme }) => theme.primaryTextColor};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerPrimaryBackgroundColor};
      color: ${({ theme }) => theme.whiteTextColor};
    }
  }

  &.button--variant-outline-secondary {
    border-color: ${({ theme }) => theme.whiteTextColor};
    color: ${({ theme }) => theme.whiteTextColor};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerSecondaryBackgroundColor};
      color: ${({ theme }) => theme.whiteTextColor};
    }
  }

  &.button--variant-primary {
    background-color: ${({ theme }) => theme.primaryBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerPrimaryBackgroundColor};
    }
  }

  &.button--variant-secondary {
    background-color: ${({ theme }) => theme.secondaryBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerSecondaryBackgroundColor};
    }
  }

  &.button--variant-danger {
    background-color: ${({ theme }) => theme.dangerBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerDangerBackgroundColor};
    }
  }

  &.button--variant-warning {
    background-color: ${({ theme }) => theme.warningBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerWarningBackgroundColor};
    }
  }

  &.button--variant-info {
    background-color: ${({ theme }) => theme.infoBackgroundColor};
    color: ${({ theme }) => theme.whiteTextColor};
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.darkerInfoBackgroundColor};
    }
  }

  &.button--variant-link {
    color: ${({ theme }) => theme.primaryBackgroundColor};
    background-color: transparent;
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      color: ${({ theme }) => theme.darkerPrimaryBackgroundColor};
    }
  }

  &.button--variant-transparent {
    color: ${({ theme }) => theme.secondaryBackgroundColor};
    background-color: transparent;
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      color: ${({ theme }) => theme.darkerSecondaryBackgroundColor};
    }
  }

  &.button--size-lg {
    height: 44px;
    padding: 0 14px;
  }

  &.button--size-sm {
    height: 28px;
    padding: 0 6px;
  }

  &.block {
    display: flex;
    width: 100%;
  }

  &:focus {
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.focusShadowColor};
  }
`

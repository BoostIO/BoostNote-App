import React, {
  MouseEventHandler,
  FocusEventHandler,
  DragEventHandler,
  PropsWithChildren,
} from 'react'
import cc from 'classcat'
import styled from '../../../lib/v2/styled'
import Icon from '@mdi/react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  iconPath?: string
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
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
      type = 'button',
      iconPath,
      disabled,
      className,
      tabIndex,
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
        ])}
        id={id}
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

const StyledButton = styled.div`
  padding: 0 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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
  transition: 200ms background-color;

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

  &.button--variant-primary {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.variants.primary.darker};
    }
  }

  &.button--variant-secondary {
    background-color: ${({ theme }) => theme.colors.variants.secondary.base};
    color: ${({ theme }) => theme.colors.variants.secondary.text};

    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) =>
        theme.colors.variants.secondary.darker};
    }
  }

  &.button--variant-danger {
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    color: ${({ theme }) => theme.colors.variants.danger.text};
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus:not(:disabled),
    &.active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.variants.danger.darker};
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
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.focus};
  }
`

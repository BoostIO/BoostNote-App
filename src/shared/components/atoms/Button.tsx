import React, {
  MouseEventHandler,
  FocusEventHandler,
  DragEventHandler,
  PropsWithChildren,
} from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import Icon, { IconSize } from './Icon'
import Spinner from '../../../components/atoms/Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'icon'
  | 'icon-secondary'
  | 'link'
  | 'transparent'
  | 'warning'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  iconPath?: string
  iconSize?: IconSize
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  active?: boolean
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
  onBlur?: FocusEventHandler<HTMLButtonElement>
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
      iconSize,
      disabled,
      active,
      className,
      tabIndex = 1,
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
      onBlur,
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
          `button__variant--${variant}`,
          size && `button__size--${size}`,
          disabled && `button__state--disabled`,
          active && `button__state--active`,
        ])}
        id={id}
        active={active}
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
        onBlur={onBlur}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        ref={ref}
      >
        {iconPath != null && (
          <Icon className='button__icon' size={iconSize} path={iconPath} />
        )}
        {children != null && <div className='button__label'>{children}</div>}
      </StyledButton>
    )
  }
)

export const LoadingButton = ({
  spinning,
  ...props
}: PropsWithChildren<ButtonProps> & { spinning?: boolean }) => {
  if (spinning) {
    return (
      <Button {...props} iconPath={undefined} disabled={true}>
        <Spinner className='button__spinner' />
      </Button>
    )
  }

  return <Button {...props} />
}

export default Button

const StyledButton = styled.button`
  padding: 0 ${({ theme }) => theme.sizes.spaces.md}px;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  height: 32px;
  outline: none;
  border-radius: 4px;
  border-color: transparent;
  border-width: 1px;
  border-style: solid;
  background: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: 200ms background-color;
  width: auto;

  & + * {
    margin-left: 5px;
  }

  .button__label {
    display: flex;
    align-items: center;
  }

  .button__icon {
    flex: 0 0 auto;
  }

  & > .button__icon + .button__label {
    margin-left: 4px;
  }

  &.button__state--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.button__variant--primary {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.primary.text};
      border-right-color: transparent;
    }

    &:not(.button__state--disabled) {
      &.focus {
        filter: brightness(103%);
      }
      &:hover {
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        filter: brightness(112%);
      }
    }
  }

  &.button__variant--link {
    background: none;
    color: ${({ theme }) => theme.colors.text.link};
    padding: 0;
    border: 0;
    height: auto !important;
    display: inline;

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.text.link};
      border-right-color: transparent;
    }

    &:not(.button__state--disabled) {
      &:hover,
      &:active,
      &:focus,
      &.button__state--active {
        opacity: 0.8;
      }
    }
  }

  &.button__variant--secondary {
    background-color: ${({ theme }) => theme.colors.variants.secondary.base};
    color: ${({ theme }) => theme.colors.variants.secondary.text};

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.secondary.text};
      border-right-color: transparent;
    }

    &:not(.button__state--disabled) {
      &.focus {
        filter: brightness(103%);
      }
      &:hover {
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        filter: brightness(112%);
      }
    }
  }

  &.button__variant--danger {
    background-color: ${({ theme }) => theme.colors.variants.danger.base};
    color: ${({ theme }) => theme.colors.variants.danger.text};

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.danger.text};
      border-right-color: transparent;
    }

    &:not(.button__state--disabled) {
      &.focus {
        filter: brightness(103%);
      }
      &:hover {
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        filter: brightness(112%);
      }
    }
  }

  &.button__variant--warning {
    background-color: ${({ theme }) => theme.colors.variants.warning.base};
    color: ${({ theme }) => theme.colors.variants.warning.text};

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.warning.text};
      border-right-color: transparent;
    }

    &:not(.button__state--disabled) {
      &.focus {
        filter: brightness(103%);
      }
      &:hover {
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        filter: brightness(112%);
      }
    }
  }

  &.button__variant--icon,
  &.button__variant--transparent {
    background: none;
    border: 1px solid transparent;
    color: ${({ theme }) => theme.colors.text.subtle};
    padding: 0 3px !important;

    &:focus {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base};
    }

    &:not(.button__state--disabled) {
      &:hover,
      &:active,
      &:focus,
      &.button__state--active {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }

  &.button__variant--icon-secondary {
    background: none;
    border: 1px solid transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 0 3px !important;

    &:focus {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base};
    }

    &:not(.button__state--disabled) {
      &:hover,
      &:focus {
        background-color: ${({ theme }) => theme.colors.background.quaternary};
      }

      &:active,
      &.button__state--active {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
      }
    }
  }

  &.button__size--lg {
    height: 40px;
    padding: 0 14px;
  }

  &.button__size--sm {
    height: 24px;
    padding: 0 6px;
  }

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base};
  }
`

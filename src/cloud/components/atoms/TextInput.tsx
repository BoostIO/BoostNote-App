import React, {
  FC,
  ChangeEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  DragEventHandler,
} from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import {
  UnroundedParamTypes,
  createUnroundedStyle,
} from '../../lib/styled/unrounded'

const { getUnroundedClassNames, unroundedStyle } = createUnroundedStyle(
  'text-input'
)

export interface TextInputProps {
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  unrounded?: UnroundedParamTypes

  type:
    | 'text'
    | 'number'
    | 'email'
    | 'datetime-local'
    | 'month'
    | 'date'
    | 'search'
    | 'password'
    | 'url'
    | 'tel'
    | 'week'
  className?: string
  disabled?: boolean
  placeholder?: string
  title?: string
  value?: string
  defaultValue?: string
  readOnly?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  onClick?: MouseEventHandler<HTMLInputElement>
  onMouseUp?: MouseEventHandler<HTMLInputElement>
  onMouseDown?: MouseEventHandler<HTMLInputElement>
  onMouseMove?: MouseEventHandler<HTMLInputElement>
  onMouseOver?: MouseEventHandler<HTMLInputElement>
  onMouseOut?: MouseEventHandler<HTMLInputElement>
  onMouseEnter?: MouseEventHandler<HTMLInputElement>
  onMouseLeave?: MouseEventHandler<HTMLInputElement>
  onDoubleClick?: MouseEventHandler<HTMLInputElement>
  onContextMenu?: MouseEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
  onDrag?: DragEventHandler<HTMLInputElement>
  onDragStart?: DragEventHandler<HTMLInputElement>
  onDragEnd?: DragEventHandler<HTMLInputElement>
  onDrop?: DragEventHandler<HTMLInputElement>
}

const TextInput: FC<TextInputProps> = ({
  value,
  className,
  size = 'md',
  unrounded,
  block,
  type,
  placeholder,
  title,
  defaultValue,
  readOnly,
  onChange,
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
}) => {
  return (
    <StyledInput
      className={cc([
        className,
        `size-${size}`,
        block && 'block',
        ...getUnroundedClassNames(unrounded),
      ])}
      value={value}
      type={type}
      placeholder={placeholder}
      title={title}
      defaultValue={defaultValue}
      readOnly={readOnly}
      onChange={onChange}
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
    />
  )
}

export default TextInput

const StyledInput = styled.input`
  padding: 0 ${({ theme }) => theme.space.xsmall}px;
  border-radius: 2px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  height: 36px;
  outline: none;
  border-radius: 4px;
  border-color: transparent;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;

  background: none;
  border: 1px solid ${({ theme }) => theme.subtleBorderColor};
  color: ${({ theme }) => theme.emphasizedTextColor};

  & + * {
    margin-left: 5px;
    &.block {
      margin-left: 0;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  ${unroundedStyle}

  &.size-lg {
    height: 44px;
    padding: 0 ${({ theme }) => theme.space.small}px;
  }

  &.size-sm {
    height: 28px;
    padding: 0 ${({ theme }) => theme.space.xsmall}px;
  }

  &.block {
    display: flex;
    width: 100%;
  }

  &:focus {
    border-color: ${({ theme }) => theme.primaryBorderColor};
  }
`

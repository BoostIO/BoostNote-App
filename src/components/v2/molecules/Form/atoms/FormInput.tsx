import React, {
  FC,
  ChangeEventHandler,
  MouseEventHandler,
  FocusEventHandler,
} from 'react'
import cc from 'classcat'
import styled from '../../../../../lib/v2/styled'

export interface FormInputProps {
  type?: 'text' | 'number' | 'email' | 'password'
  id?: string
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
}

const FormInput: FC<FormInputProps> = ({
  value,
  className,
  type = 'text',
  id,
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
}) => {
  return (
    <StyledInput
      className={cc(['form__input', className])}
      value={value}
      id={id}
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
    />
  )
}

export default FormInput

const StyledInput = styled.input`
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  height: 32px;
  outline: none;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  color: ${({ theme }) => theme.colors.text.main};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.variants.primary.base};
  }
`

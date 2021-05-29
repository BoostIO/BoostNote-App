import React, {
  ChangeEventHandler,
  MouseEventHandler,
  FocusEventHandler,
} from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'

export interface FormTextareaProps {
  type?: 'text' | 'number' | 'email' | 'password'
  id?: string
  className?: string
  disabled?: boolean
  placeholder?: string
  title?: string
  value?: string
  defaultValue?: string
  readOnly?: boolean
  autoComplete?: 'on' | 'off'
  onBlur?: FocusEventHandler<HTMLTextAreaElement>
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
  onClick?: MouseEventHandler<HTMLTextAreaElement>
  onMouseUp?: MouseEventHandler<HTMLTextAreaElement>
  onMouseDown?: MouseEventHandler<HTMLTextAreaElement>
  onMouseMove?: MouseEventHandler<HTMLTextAreaElement>
  onMouseOver?: MouseEventHandler<HTMLTextAreaElement>
  onMouseOut?: MouseEventHandler<HTMLTextAreaElement>
  onMouseEnter?: MouseEventHandler<HTMLTextAreaElement>
  onMouseLeave?: MouseEventHandler<HTMLTextAreaElement>
  onDoubleClick?: MouseEventHandler<HTMLTextAreaElement>
  onContextMenu?: MouseEventHandler<HTMLTextAreaElement>
  onFocus?: FocusEventHandler<HTMLTextAreaElement>
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      value,
      className,
      type = 'text',
      autoComplete = 'off',
      id,
      placeholder,
      title,
      defaultValue,
      readOnly,
      disabled,
      onBlur,
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
    },
    ref
  ) => {
    return (
      <StyledTextarea
        className={cc(['form__textarea', className])}
        value={value}
        id={id}
        type={type}
        placeholder={placeholder}
        title={title}
        defaultValue={defaultValue}
        readOnly={readOnly}
        ref={ref}
        autoComplete={autoComplete}
        disabled={disabled}
        onBlur={onBlur}
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
)

export default FormTextarea

const StyledTextarea = styled.textarea`
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  outline: none;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  color: ${({ theme }) => theme.colors.text.primary};
  height: 200px;
  resize: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.variants.primary.base};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.variants.info.base};
  }
`

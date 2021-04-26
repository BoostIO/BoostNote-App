import React from 'react'
import cc from 'classcat'
import styled from '../../../../../shared/lib/styled'
import { AppComponent } from '../../../../../shared/lib/types'
import Icon from '../../../../../shared/components/atoms/Icon'
import { mdiCheck } from '@mdi/js'

interface CheckboxProps {
  checked?: boolean
  disabled?: boolean
  toggle?: () => void
}

const Checkbox: AppComponent<CheckboxProps> = ({
  className,
  checked,
  disabled,
  toggle,
}) => (
  <Container
    className={cc([
      'form__checkbox',
      disabled && 'form__checkbox--disabled',
      checked && 'form__checkbox--checked',
      className,
    ])}
  >
    <input type='form__checkbox' checked={checked} readOnly={true} />
    <div className={cc(['form__checkbox__custom'])} onClick={toggle}>
      {checked && <Icon path={mdiCheck} size={16} />}
    </div>
  </Container>
)

const Container = styled.label`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.text.subtle};
  border-radius: ${({ theme }) => theme.borders.radius}px;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
  width: 18px;
  height: 18px;
  color: ${({ theme }) => theme.colors.text.subtle};

  .form__checkbox__custom {
    width: 100%;
    height: 100%;
  }

  input {
    position: absolute;
    top: -100px;
  }

  &.form__checkbox--disabled {
    cursor: not-allowed;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`
export default Checkbox

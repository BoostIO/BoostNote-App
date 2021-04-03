import React from 'react'
import cc from 'classcat'
import styled from '../../../../../lib/v2/styled'
import { AppComponent } from '../../../../../lib/v2/types'
import Icon from '../../../atoms/Icon'
import { mdiCheck } from '@mdi/js'

interface CheckboxProps {
  checked?: boolean
  disabled?: boolean
  onChange?: (val: boolean) => void
}

const Checkbox: AppComponent<CheckboxProps> = ({
  className,
  checked,
  disabled,
  onChange,
}) => (
  <Container
    className={cc([
      'form__checkbox',
      disabled && 'form__checkbox--disabled',
      checked && 'form__checkbox--checked',
      className,
    ])}
  >
    <input
      type='form__checkbox'
      checked={checked}
      onChange={(event) => {
        if (onChange != null) {
          event.preventDefault()
          onChange(!checked)
        }
      }}
    />
    <div className={cc(['form__checkbox__custom'])}>
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

  input {
    position: absolute;
    top: -100px;
  }

  &.form__checkbox--disabled {
    cursor: not-allowed;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.second};
  }
`
export default Checkbox

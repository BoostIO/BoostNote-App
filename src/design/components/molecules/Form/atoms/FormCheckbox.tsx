import React from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import Icon from '../../../atoms/Icon'
import { mdiCheck } from '@mdi/js'

interface CheckboxProps {
  id?: string
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
      {checked && (
        <Icon path={mdiCheck} className='form__checkbox__checked' size={16} />
      )}
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
  cursor: pointer;
  flex-shrink: 0;

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

  .form__checkbox__checked {
    position: absolute;
    left: 0;
    top: 0;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`

export default Checkbox

type CheckboxWithLabelProps = CheckboxProps & {
  label: React.ReactNode | string
}
export const CheckboxWithLabel: AppComponent<CheckboxWithLabelProps> = ({
  label,
  toggle,
  ...props
}) => (
  <CheckboxWithLabelContainer onClick={toggle}>
    <Checkbox {...props} />
    {typeof label === 'string' ? (
      <span className='form__checkbox__label'></span>
    ) : (
      label
    )}
  </CheckboxWithLabelContainer>
)

const CheckboxWithLabelContainer = styled.div`
  display: flex;
  align-items: center;
  vertical-align: middle;

  .form__checkbox {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  & > :not(.form__checkbox__label) {
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

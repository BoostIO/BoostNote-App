import React from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'

interface RadioProps {
  checked?: boolean
  disabled?: boolean
  toggle?: () => void
}

const Radio: AppComponent<RadioProps> = ({
  className,
  checked,
  disabled,
  toggle,
}) => (
  <Container
    className={cc([
      'form__radio',
      disabled && 'form__radio--disabled',
      checked && 'form__radio--checked',
      className,
    ])}
  >
    <input type='radio' checked={checked} readOnly={true} />
    <div className={cc(['form__radio__custom'])} onClick={toggle}></div>
  </Container>
)

const Container = styled.label`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.text.subtle};
  border-radius: 50%;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
  width: 18px;
  height: 18px;
  color: ${({ theme }) => theme.colors.text.subtle};

  .form__radio__custom {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &.form__radio--checked {
    border-color: ${({ theme }) =>
      theme.colors.variants.primary.base} !important;

    &::after {
      content: '';
      width: 12px;
      height: 12px;
      background: ${({ theme }) => theme.colors.variants.primary.base};
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }
  }

  input {
    position: absolute;
    top: -100px;
  }

  &.form__radio--disabled {
    cursor: not-allowed;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`
export default Radio

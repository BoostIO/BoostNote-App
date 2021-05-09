import React from 'react'
import styled from '../../../../lib/styled'

interface SettingInputProps {
  label?: string
  value?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const SettingInput = ({ label, value, onChange }: SettingInputProps) => (
  <Container className='setting__input'>
    <label>{label}</label>
    <input value={value} onChange={onChange} />
  </Container>
)

const Container = styled.div`
  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  input {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    height: 40px;
    max-width: 400px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.text.primary};

    &:focus {
      border-color: ${({ theme }) => theme.colors.variants.primary.base};
    }
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
`

export default SettingInput

import React from 'react'
import styled from '../../../../lib/styled'

interface SettingSelectProps {
  label?: string
  value?: string
  disabled?: boolean
  onChange?: (val: any) => void
  options: React.ReactNode
}

const SettingSelect = ({
  label,
  value,
  disabled,
  onChange,
  options,
}: SettingSelectProps) => (
  <Container className='setting__select'>
    <label>{label}</label>
    <select value={value} disabled={disabled} onChange={onChange}>
      {options}
    </select>
  </Container>
)

const Container = styled.div`
  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  select {
    width: 100%;
    height: 40px;
    max-width: 400px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.primary};

    &:focus {
      border-color: ${({ theme }) => theme.colors.variants.primary.base};
    }

    option {
      color: initial;
    }
  }
`

export default SettingSelect

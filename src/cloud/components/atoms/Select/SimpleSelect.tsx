import React, { useState } from 'react'
import styled from '../../../lib/styled'

interface SimpleSelectProps<T extends string> {
  options: T[]
  value: T
  onChange: (option: T) => void
  label: string
}

const SimpleSelect = <T extends string>({
  options,
  value,
  onChange,
  label,
}: SimpleSelectProps<T>) => {
  const [elementId] = useState(() => btoa(Math.random().toString()).slice(0, 5))
  return (
    <StyledSimpleSelect>
      <label htmlFor={elementId}>{label}</label>
      <select
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
        id={elementId}
      >
        {options.map((option) => (
          <option value={option} key={`sort-${option}`}>
            {option}
          </option>
        ))}
      </select>
    </StyledSimpleSelect>
  )
}

export const StyledSimpleSelect = styled.div`
  label {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
  }
  display: flex;
  justify-content: flex-start;
  margin-right: ${({ theme }) => theme.space.xsmall}px;
  color: ${({ theme }) => theme.subtleTextColor};
  align-items: center;
  select {
    background: none;
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    height: auto;
    border: 0;
    cursor: pointer;
    transition: 0.2s;
    &:hover,
    &.active {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }
    &:focus {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }
  }
`

export default SimpleSelect

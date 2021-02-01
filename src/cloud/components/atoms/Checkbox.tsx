import React, { useState, useCallback, useMemo } from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import Flexbox from './Flexbox'

interface CheckboxProps {
  checked?: boolean
  label?: React.ReactNode
  className?: string
  disabled?: boolean
  style?: React.CSSProperties
  onChange?: (val: boolean) => void
}

const Checkbox = ({
  onChange,
  checked = false,
  disabled,
  label,
  className,
  style,
}: CheckboxProps) => {
  const [elementId] = useState(() => btoa(Math.random().toString()).slice(0, 8))

  const onClick = useCallback(() => {
    if (onChange == null || disabled) {
      return
    }

    onChange(!checked)
  }, [onChange, checked, disabled])

  const checkboxStyle: React.CSSProperties = useMemo(() => {
    const size = 15
    if ((className || '').includes('reducer') && !checked) {
      const fontSize = size * 1.3
      return {
        width: size,
        height: size,
        fontSize: fontSize,
        lineHeight: `${fontSize * 0.6}px`,
      }
    }

    return {
      width: size,
      height: size,
      fontSize: size * 1.2,
      lineHeight: `${size * 0.8}px`,
    }
  }, [className, checked])

  const labelNode = useMemo(() => {
    if (label == null) {
      return null
    }

    if (typeof label === 'string') {
      return <span>{label}</span>
    }

    return <div className='margin-left'>{label}</div>
  }, [label])

  return (
    <Flexbox flex='0 0 auto' style={style}>
      <input
        type='checkbox'
        id={elementId}
        style={{ display: 'none' }}
        checked={checked}
        disabled={disabled}
        onChange={undefined}
      />
      <StyledLabel
        htmlFor={elementId}
        onClick={onClick}
        className={cc([disabled && 'disabled', className])}
      >
        <StyledCheckbox
          style={checkboxStyle}
          className={cc([
            'checkbox',
            checked && 'checked',
            'custom-check',
            disabled && 'disabled',
          ])}
        />
        {labelNode}
      </StyledLabel>
    </Flexbox>
  )
}

const StyledCheckbox = styled.div`
  display: inline-block;
  border: 2px solid ${({ theme }) => theme.subtleIconColor};
  border-radius: 2px;
  transition: 0.3s;
  cursor: pointer;
  position: relative;

  &.disabled {
    cursor: not-allowed;
  }

  &::after {
    position: relative;
    left: -2px;
    color: transparent;
    content: '✓' !important;
    font-size: inherit !important;
    pointer-events: none;
  }

  &.checked {
    &::after {
      color: ${({ theme }) => theme.subtleIconColor};
    }

    &:hover::after {
      color: ${({ theme }) => theme.emphasizedIconColor};
    }
  }
`

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.subtleTextColor};
  margin-bottom: 0;
  cursor: pointer;
  vertical-align: middle;
  font-size: inherit;
  line-height: 0;

  &.disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }

  .icon {
    color: ${({ theme }) => theme.baseIconColor};
  }

  > span,
  > .margin-left {
    margin-left: ${({ theme }) => theme.space.xsmall}px;
  }

  span {
    color: ${({ theme }) => theme.baseTextColor};
  }

  &:hover:not(.disabled) {
    color: ${({ theme }) => theme.emphasizedIconColor};
    .checkbox {
      border-color: ${({ theme }) => theme.emphasizedIconColor};

      &::after {
        color: ${({ theme }) => theme.emphasizedIconColor};
      }
    }
  }

  &.reducer {
    .checkbox:not(.checked)::after {
      content: '-';
      left: 2px;
    }
  }
`

export default Checkbox

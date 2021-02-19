import React, { HTMLProps, useState, useRef, useEffect, useMemo } from 'react'
import styled from '../../lib/styled'

interface ClickInputProps extends HTMLProps<HTMLInputElement> {
  value?: string
  initalFocus?: boolean
  format?: (str: string) => string
}

const ClickInput = ({
  value,
  placeholder,
  format,
  initalFocus = false,
  ...props
}: ClickInputProps) => {
  const [open, setOpen] = useState(initalFocus)
  const inputRef = useRef<HTMLInputElement>(null)

  const onBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setOpen(false)
    if (props.onBlur != null) {
      props.onBlur(e)
    }
  }

  useEffect(() => {
    if (open && inputRef.current != null) {
      inputRef.current.focus()
    }
  }, [open])

  const displayValue = useMemo(() => {
    const withDefault = orDefault(value, placeholder || '')
    return format != null ? format(withDefault) : withDefault
  }, [value, placeholder, format])

  return open ? (
    <input
      {...props}
      value={value}
      placeholder={placeholder}
      onBlur={onBlur}
      ref={inputRef}
    />
  ) : (
    <StyledValueDisplay onClick={() => setOpen(true)}>
      {displayValue}
    </StyledValueDisplay>
  )
}

export default ClickInput

const StyledValueDisplay = styled.span`
  display: inline-block;
  cursor: pointer;
`

function orDefault(str: string | null | undefined, defaultStr: string) {
  return str != null && str !== '' ? str : defaultStr
}

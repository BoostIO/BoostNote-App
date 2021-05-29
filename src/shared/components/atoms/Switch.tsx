import React from 'react'
import ReactSwitch from 'react-switch'
import cc from 'classcat'
import styled from '../../lib/styled'

interface SwitchProps {
  disabled?: boolean
  id?: string
  className?: string
  onChange: (
    checked: boolean,
    event: MouseEvent | React.SyntheticEvent<MouseEvent | KeyboardEvent, Event>,
    id: string
  ) => void
  checked: boolean
  height?: number
  width?: number
  handleSize?: number
}

const Switch = ({
  disabled,
  id,
  className,
  onChange,
  checked,
  height = 24,
  width = 38,
  handleSize = 16,
}: SwitchProps) => {
  return (
    <Container
      className={cc(['switch__wrapper', checked && `switch__wrapper--checked`])}
    >
      <ReactSwitch
        disabled={disabled}
        className={cc([`switch`, className])}
        type='switch'
        id={id}
        onChange={onChange}
        checked={checked}
        uncheckedIcon={false}
        checkedIcon={false}
        height={height}
        width={width}
        handleDiameter={handleSize}
      />
    </Container>
  )
}

const Container = styled.div`
  .switch {
    .react-switch-bg {
      background: ${({ theme }) =>
        theme.colors.variants.secondary.base} !important;
    }

    .react-switch-handle {
      background: ${({ theme }) =>
        theme.colors.variants.secondary.text} !important;
    }
  }

  &.switch__wrapper--checked .switch {
    .react-switch-bg {
      background: ${({ theme }) =>
        theme.colors.variants.primary.base} !important;
    }
    .react-switch-handle {
      background: ${({ theme }) =>
        theme.colors.variants.primary.text} !important;
    }
  }
`

export default Switch

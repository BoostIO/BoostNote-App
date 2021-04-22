import React, { useMemo } from 'react'
import ReactSwitch, { ReactSwitchProps } from 'react-switch'
import cc from 'classcat'

const Switch = ({
  disabled,
  id,
  className,
  onChange,
  checked,
  height = 20,
  width = 30,
}: ReactSwitchProps) => {
  const customStyle: Partial<ReactSwitchProps> = useMemo(() => {
    if (checked) {
      return {}
    }

    return {}
  }, [checked])

  return (
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
      {...customStyle}
    />
  )
}

export default Switch

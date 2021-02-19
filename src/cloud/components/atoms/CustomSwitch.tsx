import React, { useMemo } from 'react'
import Switch, { ReactSwitchProps } from 'react-switch'
import { useSettings } from '../../lib/stores/settings'
import { selectTheme } from '../../lib/styled'

type CustomSwitchProps = ReactSwitchProps & {
  variant?: 'primary' | 'success'
}

const CustomSwitch = ({
  disabled,
  id,
  className,
  onChange,
  checked,
  uncheckedIcon,
  checkedIcon,
  height = 20,
  width = 45,
  variant = 'primary',
}: CustomSwitchProps) => {
  const { settings } = useSettings()

  const customStyle: Partial<ReactSwitchProps> = useMemo(() => {
    const appTheme = selectTheme(settings['general.theme'])
    switch (variant) {
      case 'primary':
        return {
          onColor: appTheme.primaryBackgroundColor,
        }

      case 'success':
      default:
        return {
          onColor: '#5580DC',
        }
    }
  }, [variant, settings])

  return (
    <Switch
      disabled={disabled}
      className={className}
      type='switch'
      id={id}
      onChange={onChange}
      checked={checked}
      uncheckedIcon={uncheckedIcon}
      checkedIcon={checkedIcon}
      height={height}
      width={width}
      {...customStyle}
    />
  )
}

export default CustomSwitch

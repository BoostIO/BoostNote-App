import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'

interface IconProps {
  path: string
  color?: string
  size?: 20
  style?: React.CSSProperties
  className?: string
  spin?: boolean
}

const Icon = ({
  path,
  color = 'currentColor',
  size,
  style,
  className,
  spin,
}: IconProps) => (
  <MdiIcon
    path={path}
    style={{
      ...(size == null
        ? {
            width: '1em',
            height: '1em',
          }
        : {
            width: `${size}px`,
            height: `${size}px`,
          }),
      ...style,
    }}
    color={color}
    className={className}
    spin={spin}
  />
)

export default Icon

import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'

interface IconProps {
  path: string
  color?: string
  size?: number
  style?: React.CSSProperties
  className?: string
}

const Icon = ({
  path,
  color = 'currentColor',
  size,
  style,
  className,
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
  />
)

export default Icon

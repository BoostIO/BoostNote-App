import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'

interface IconProps {
  path: string
  color?: string
  size?: number
}

const Icon = ({ path, color = 'currentColor', size }: IconProps) => (
  <MdiIcon
    path={path}
    style={
      size == null
        ? {
            width: '1em',
            height: '1em',
          }
        : {
            width: `${size}px`,
            height: `${size}px`,
          }
    }
    color={color}
  />
)

export default Icon

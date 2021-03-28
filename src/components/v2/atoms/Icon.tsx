import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'
import cc from 'classcat'

export type IconSize = 16 | 22

interface IconProps {
  path: string
  color?: string
  size?: IconSize
  className?: string
  spin?: boolean
}

const Icon = ({
  path,
  color = 'currentColor',
  size,
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
    }}
    color={color}
    className={cc(['icon', className])}
    spin={spin}
  />
)

export default Icon

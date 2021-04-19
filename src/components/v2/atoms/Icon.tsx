import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'
import cc from 'classcat'

export type IconSize = 16 | 22 | 26 | 34

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
  size = 22,
  className,
  spin,
}: IconProps) => (
  <MdiIcon
    path={path}
    style={{
      width: `${size}px`,
      height: `${size}px`,
    }}
    color={color}
    className={cc(['icon', className])}
    spin={spin}
  />
)

export default Icon

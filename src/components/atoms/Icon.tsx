import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'

interface IconProps {
  path: string
  color?: string
}

const Icon = ({ path, color = 'currentColor' }: IconProps) => (
  <MdiIcon
    path={path}
    style={{
      width: '1em',
      height: '1em',
    }}
    color={color}
  />
)

export default Icon

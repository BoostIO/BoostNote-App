import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'

interface IconProps {
  path: string
}

const Icon = ({ path }: IconProps) => (
  <MdiIcon
    path={path}
    style={{
      width: '1em',
      height: '1em'
    }}
    color='currentColor'
  />
)

export default Icon

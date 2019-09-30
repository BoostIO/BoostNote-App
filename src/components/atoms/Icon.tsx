import React from 'react'
import MdiIcon from '@mdi/react'

interface IconProps {
  path: string
  className?: string
}

const Icon = ({ path, className }: IconProps) => (
  <MdiIcon path={path} className={className} size='1em' color='currentColor' />
)

export default Icon

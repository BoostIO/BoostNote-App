import React from 'react'
import MdiIcon from '@mdi/react'

interface IconProps {
  path: string
}

const Icon = ({ path }: IconProps) => (
  <MdiIcon path={path} size='1em' color='currentColor' />
)

export default Icon

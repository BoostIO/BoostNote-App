import React from 'react'
import Icon from '@mdi/react'

interface IconProps {
  path: string
  size?: number | string
  style?: React.CSSProperties
  className?: string
}

const IconMdi = ({ path, style, size, className }: IconProps) => (
  <Icon
    path={path}
    className={className}
    style={{
      fill: 'currentColor',
      width: size != null ? size : '0.9em',
      height: size != null ? size : '0.9em',
      ...style,
    }}
  />
)

export default IconMdi

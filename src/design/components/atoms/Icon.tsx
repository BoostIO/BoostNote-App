import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'
import cc from 'classcat'
import styled from '../../lib/styled'

export type IconSize = 12 | 16 | 20 | 26 | 34 | 50 | 100

export interface IconProps {
  path: string
  color?: string
  size?: IconSize
  className?: string
  spin?: boolean
  notify?: boolean
  style?: React.CSSProperties
}

const Icon = ({
  path,
  color = 'currentColor',
  size = 20,
  className,
  spin,
  style,
}: IconProps) => (
  <MdiIcon
    path={path}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      ...style,
    }}
    color={color}
    className={cc(['icon', className])}
    spin={spin}
  />
)

export const PrimaryIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.primary.base};
`

export const SuccessIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.success.base};
`

export const WarningIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.danger.base};
`
export default Icon

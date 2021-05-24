import React from 'react'
import { Icon as MdiIcon } from '@mdi/react'
import cc from 'classcat'
import styled from '../../lib/styled'

export type IconSize = 16 | 20 | 26 | 34

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
  size = 20,
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

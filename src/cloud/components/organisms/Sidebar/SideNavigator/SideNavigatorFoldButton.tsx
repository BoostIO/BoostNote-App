import React from 'react'
import cc from 'classcat'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'
import IconMdi from '../../../atoms/IconMdi'
import { SideNavFoldButtonStyle } from './styled'

interface SideNavigatorFoldButtonProps {
  hasChildren: boolean
  folded: boolean
  depth: number
  toggle: () => void
}

const SideNavigatorFoldButton = ({
  hasChildren,
  folded,
  depth,
  toggle,
}: SideNavigatorFoldButtonProps) => {
  if (!hasChildren) {
    return null
  }

  return (
    <SideNavFoldButtonStyle
      className={cc([folded && 'folded'])}
      onClick={toggle}
      tabIndex={-1}
      style={{
        left: `${12 * (depth - 1) + 4}px`,
      }}
    >
      {folded ? (
        <IconMdi path={mdiChevronRight} />
      ) : (
        <IconMdi path={mdiChevronDown} />
      )}
    </SideNavFoldButtonStyle>
  )
}

export default SideNavigatorFoldButton

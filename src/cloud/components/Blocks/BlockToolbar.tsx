import React, { PropsWithChildren } from 'react'
import Portal from '../../../design/components/atoms/Portal'
import Toolbar, {
  ToolbarControlProps,
} from '../../../design/components/organisms/Toolbar'

const BlockToolbar = ({
  controls = [],
  children,
}: PropsWithChildren<{
  controls?: ToolbarControlProps[]
}>) => {
  const portalContainer = document.getElementById(
    'block__editor__view__toolbar-portal'
  )

  if (portalContainer == null) {
    return null
  }

  return (
    <Portal target={portalContainer}>
      <Toolbar className='block__view__container__add' controls={controls}>
        {children}
      </Toolbar>
    </Portal>
  )
}

export default BlockToolbar

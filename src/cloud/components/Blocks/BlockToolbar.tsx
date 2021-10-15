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
  return (
    <Portal
      domTarget={document.getElementById('block__editor__view__toolbar-portal')}
    >
      <Toolbar className='block__view__container__add' controls={controls}>
        {children}
      </Toolbar>
    </Portal>
  )
}

export default BlockToolbar

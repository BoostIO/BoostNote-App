import React from 'react'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface VerticalScrollerProps {
  onClick?: React.MouseEventHandler
}
const VerticalScroller: AppComponent<VerticalScrollerProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <OverlayScrollbarsComponent
      className={cc(['vertical__scroller', className])}
      options={{ scrollbars: { autoHide: 'scroll', autoHideDelay: 300 } }}
      onClick={onClick}
    >
      {children}
    </OverlayScrollbarsComponent>
  )
}

export default VerticalScroller

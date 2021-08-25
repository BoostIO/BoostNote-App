import React from 'react'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface VerticalScrollerProps {
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
  overflowBehavior?: {
    x?: OverlayScrollbars.OverflowBehavior
    y?: OverlayScrollbars.OverflowBehavior
  }
}
const VerticalScroller: AppComponent<VerticalScrollerProps> = ({
  style,
  children,
  className,
  overflowBehavior,
  onClick,
}) => {
  return (
    <OverlayScrollbarsComponent
      className={cc(['vertical__scroller', className])}
      options={{
        scrollbars: {
          autoHide: 'scroll',
          autoHideDelay: 300,
        },
        overflowBehavior,
      }}
      onClick={onClick}
      style={style}
    >
      {children}
    </OverlayScrollbarsComponent>
  )
}

export default VerticalScroller

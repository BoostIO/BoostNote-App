import React, { PropsWithChildren } from 'react'
import cc from 'classcat'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface ScrollerProps {
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
  className?: string
  id?: string
  ref?: React.LegacyRef<OverlayScrollbarsComponent>
  overflowBehavior?: {
    x?: OverlayScrollbars.OverflowBehavior
    y?: OverlayScrollbars.OverflowBehavior
  }
}
const Scroller = React.forwardRef<
  OverlayScrollbarsComponent,
  PropsWithChildren<ScrollerProps>
>(({ style, children, className, overflowBehavior, id, onClick }, ref) => {
  return (
    <OverlayScrollbarsComponent
      className={cc(['vertical__scroller', className])}
      options={{
        scrollbars: {
          autoHide: 'scroll',
          autoHideDelay: 300,
        },
        overflowBehavior,
        clipAlways: false,
      }}
      id={id}
      onClick={onClick}
      style={style}
      ref={ref}
    >
      {children}
    </OverlayScrollbarsComponent>
  )
})

export default React.memo(Scroller)

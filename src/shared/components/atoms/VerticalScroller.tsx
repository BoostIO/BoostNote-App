import React, { useCallback, useRef, useState } from 'react'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'
import styled from '../../lib/styled'
import { scrollbarOverlay } from '../../lib/styled/styleFunctions'

const VerticalScroller: AppComponent<{}> = ({ children, className }) => {
  const [inScroll, setInScroll] = useState(false)
  const scrollTimer = useRef<any>()

  const onScrollHandler: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    setInScroll(true)
    scrollTimer.current = setTimeout(() => {
      setInScroll(false)
    }, 600)
  }, [])

  return (
    <Container
      className={cc([
        'vertical__scroller',
        inScroll && 'vertical__scroller--scrolling',
        className,
      ])}
      onScroll={onScrollHandler}
    >
      {children}
    </Container>
  )
}

const Container = styled.div`
  ${(theme) => scrollbarOverlay(theme, 'y', 'vertical__scroller--scrolling')}
`

export default VerticalScroller

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  CSSProperties
} from 'react'
import styled, { defaultTheme } from '../../lib/styled'
import throttle from 'lodash/throttle'
import { clamp } from 'ramda'

interface TwoPaneLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  style?: CSSProperties
  defaultLeftWidth?: number
  maxLeftWidth?: number
  onResizeEnd?: (leftWidth: number) => void
}

const minLeftWidth = 100

const Container = styled.div`
  flex: 1px;
  position: relative;
  overflow: hidden;
`

const Pane = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: hidden;
`

const DividerBorder = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.border};
`

const DividerGraple = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  border: 3px solid;
  box-sizing: content-box;
  margin: -3px;
  z-index: 100;
  user-select: none;
  cursor: col-resize;
`

interface DividerProps {
  onMouseDown: React.MouseEventHandler
  dragging: boolean
  leftWidth: number
}

const Divider = ({ onMouseDown, dragging, leftWidth }: DividerProps) => (
  <DividerGraple
    onMouseDown={onMouseDown}
    style={{
      left: `${leftWidth}px`,
      borderColor: dragging ? defaultTheme.colors.active : 'transparent'
    }}
  >
    <DividerBorder />
  </DividerGraple>
)

const TwoPaneLayout = ({
  left,
  right,
  className,
  style,
  defaultLeftWidth = 250,
  maxLeftWidth = 500,
  onResizeEnd
}: TwoPaneLayoutProps) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [dragging, setDragging] = useState(false)
  const mouseupListenerIsSetRef = useRef(false)
  const dragStartXPositionRef = useRef(0)
  const previousLeftWidthRef = useRef(leftWidth)

  const startDragging = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      dragStartXPositionRef.current = event.clientX
      previousLeftWidthRef.current = leftWidth
      setDragging(true)
    },
    [leftWidth]
  )

  const endDragging = useCallback((event: MouseEvent) => {
    event.preventDefault()
    setDragging(false)
  }, [])

  const moveDragging = useCallback(
    throttle((event: MouseEvent) => {
      event.preventDefault()
      const diff = event.clientX - dragStartXPositionRef.current
      setLeftWidth(
        clamp(minLeftWidth, maxLeftWidth, previousLeftWidthRef.current + diff)
      )
    }, 1000 / 30),
    []
  )

  useEffect(() => {
    if (dragging && !mouseupListenerIsSetRef.current) {
      window.addEventListener('mouseup', endDragging)
      window.addEventListener('mousemove', moveDragging)
      mouseupListenerIsSetRef.current = true
      return
    }

    if (!dragging && mouseupListenerIsSetRef.current) {
      window.removeEventListener('mouseup', endDragging)
      window.removeEventListener('mousemove', moveDragging)
      mouseupListenerIsSetRef.current = false
      return
    }

    return () => {
      if (mouseupListenerIsSetRef.current) {
        window.removeEventListener('mouseup', endDragging)
        window.removeEventListener('mousemove', moveDragging)
      }
    }
  }, [dragging, endDragging, moveDragging])

  useEffect(() => {
    if (onResizeEnd != null && !dragging) {
      onResizeEnd(leftWidth)
    }
  }, [onResizeEnd, leftWidth, dragging])

  return (
    <Container className={className} style={style}>
      <Pane style={{ width: `${leftWidth}px`, left: 0 }}>{left}</Pane>
      <Divider
        onMouseDown={startDragging}
        leftWidth={leftWidth}
        dragging={dragging}
      />
      <Pane style={{ left: `${leftWidth + 1}px`, right: 0 }}>{right}</Pane>
    </Container>
  )
}

export default TwoPaneLayout

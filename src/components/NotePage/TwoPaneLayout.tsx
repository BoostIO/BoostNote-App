import React, { useState, useCallback, useEffect, useRef } from 'react'
import styled, { defaultTheme } from '../../lib/styled'
import throttle from 'lodash/throttle'

interface TwoPaneLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

const defaultLeftWidth = 250

const Container = styled.div`
  display: flex;
`

const Pane = styled.div`
  flex: 1;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  border: 3px solid;
  box-sizing: content-box;
  margin: -3px;
  z-index: 100;
  user-select: none;
`

const TwoPaneLayout = ({ left, right }: TwoPaneLayoutProps) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [dragging, setDragging] = useState(false)
  const mouseupListenerIsSetRef = useRef(false)
  const dragStartXPositionRef = useRef(0)

  const startDragging = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    dragStartXPositionRef.current = event.clientX
    setDragging(true)
  }, [])

  const endDragging = useCallback((event: MouseEvent) => {
    event.preventDefault()
    setDragging(false)
  }, [])

  const moveDragging = useCallback(
    throttle((event: MouseEvent) => {
      event.preventDefault()
      console.log(event.clientX - dragStartXPositionRef.current)
    }, 1000 / 30),
    []
  )

  useEffect(
    () => {
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
    },
    [dragging, endDragging, moveDragging]
  )

  return (
    <Container>
      <Pane style={{ width: leftWidth }}>{left}</Pane>
      <Divider
        onMouseDown={startDragging}
        style={{
          borderColor: dragging ? defaultTheme.colors.active : 'transparent'
        }}
      />
      <Pane>{right}</Pane>
    </Container>
  )
}

export default TwoPaneLayout

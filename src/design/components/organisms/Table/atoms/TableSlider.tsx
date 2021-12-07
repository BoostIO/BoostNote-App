import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'
import throttle from 'lodash/throttle'
import { clamp } from 'ramda'

interface TableSliderProps {
  defaultWidth: number
  minWidth: number
  maxWidth: number
  onResizeEnd?: (leftWidth: number) => void
  onWidthChange?: (newWidth: number) => void
}

const TableSlider = ({
  defaultWidth,
  minWidth,
  maxWidth,
  onResizeEnd,
  onWidthChange,
}: TableSliderProps) => {
  const [leftWidth, setLeftWidth] = useState(defaultWidth)
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

  const moveDragging = useMemo(() => {
    return throttle((event: MouseEvent) => {
      event.preventDefault()
      const diff = event.clientX - dragStartXPositionRef.current
      const newWidth = clamp(
        minWidth,
        maxWidth,
        previousLeftWidthRef.current + diff
      )
      setLeftWidth(newWidth)
      if (onWidthChange != null) {
        onWidthChange(newWidth)
      }
    }, 20)
  }, [minWidth, maxWidth, onWidthChange])

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
    if (onResizeEnd != null && !dragging && leftWidth != defaultWidth) {
      onResizeEnd(leftWidth)
    }
  }, [onResizeEnd, leftWidth, dragging, defaultWidth])

  return (
    <Container className={'table-slider'}>
      <div
        className={cc(['table-slider__divider', dragging && 'active'])}
        onMouseDown={startDragging}
      >
        <div className='table-slider__divider--border' />
      </div>
    </Container>
  )
}

export default TableSlider

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 5px;
  margin: 0 -2px;
  position: relative;
  z-index: 1;

  cursor: col-resize;
  user-select: none;

  .table-slider__divider {
    border: 3px solid transparent;
    box-sizing: content-box;
    margin: -3px;
    z-index: 100;
    user-select: none;
    cursor: col-resize;

    &.active {
      border-color: ${({ theme }) => theme.colors.variants.primary.base};
    }
  }

  .table-slider__divider--border {
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.border.main};
  }
`

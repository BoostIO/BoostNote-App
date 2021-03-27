import React, { useState, useCallback, useEffect, useRef } from 'react'
import throttle from 'lodash/throttle'
import { clamp } from 'ramda'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'

interface WidthEnlargerProps {
  className?: string
  position?: 'left' | 'right'
  defaultWidth: number
  minWidth: number
  maxWidth: number
  onResizeEnd?: (leftWidth: number) => void
}

const WidthEnlarger: React.FC<WidthEnlargerProps> = ({
  children,
  position = 'left',
  className,
  defaultWidth,
  minWidth,
  maxWidth,
  onResizeEnd,
}) => {
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

  const moveDragging = useCallback(
    throttle((event: MouseEvent) => {
      event.preventDefault()
      const diff = event.clientX - dragStartXPositionRef.current
      setLeftWidth(
        clamp(minWidth, maxWidth, previousLeftWidthRef.current + diff)
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
    <Container className={cc(['width__enlarger', className])}>
      {position === 'left' && (
        <div
          className={cc(['width__enlarger__divider', dragging && 'active'])}
          onMouseDown={startDragging}
        >
          <div className='width__enlarger__divider__border' />
        </div>
      )}
      <div
        className='width__enlarger__content'
        style={{ width: `${leftWidth}px` }}
      >
        {children}
      </div>
      {position === 'right' && (
        <div
          className={cc(['width__enlarger__divider', dragging && 'active'])}
          onMouseDown={startDragging}
        >
          <div className='width__enlarger__divider__border' />
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  position: relative;
  align-items: top;
  justify-content: flex-start;
  height: auto;

  .application__layout__panel {
    display: block;
    flex: 0 0 0px;
  }

  .application__layout__panel__right {
    display: block;
    flex: 1 1 0px;
  }

  .width__enlarger__divider {
    border: 3px solid;
    border-color: transparent;
    box-sizing: content-box;
    margin: -3px;
    z-index: 100;
    user-select: none;
    cursor: col-resize;
    &.active {
      border-color: ${({ theme }) => theme.colors.variants.primary.base};
    }
  }

  .width__enlarger__divider__border {
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.border.main};
  }
`

export default WidthEnlarger

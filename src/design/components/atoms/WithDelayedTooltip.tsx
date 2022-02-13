import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import { useWillUnmountRef } from '../../../lib/hooks'

interface WithTooltipProps {
  className?: string
  side?: 'right' | 'bottom' | 'bottom-right' | 'top'
  tooltip?: React.ReactNode
  tooltipDelay: number
}

const posOffset = 5
const WithDelayedTooltip: React.FC<WithTooltipProps> = ({
  children,
  tooltip,
  className,
  side = 'bottom',
  tooltipDelay,
}) => {
  const [status, setStatus] = useState<'idle' | 'wait' | 'show'>('idle')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { willUnmountRef } = useWillUnmountRef()

  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>()
  const ref = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (status !== 'idle') {
      return
    }
    setStatus('wait')
    timerRef.current = setTimeout(() => {
      if (willUnmountRef.current) {
        return
      }
      setStatus('show')
    }, tooltipDelay)
  }, [status, timerRef, tooltipDelay, willUnmountRef])

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
    }
    setStatus('idle')
  }, [timerRef])

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [willUnmountRef])

  const onMouseOver = useCallback(() => {
    if (ref.current == null || tooltipRef.current == null) {
      setTooltipStyle(undefined)
      return
    }

    const rectOffset = ref.current.getBoundingClientRect()
    const tooltipOffset = tooltipRef.current.getBoundingClientRect()

    let style: React.CSSProperties = {}
    switch (side) {
      case 'right':
        style = {
          left: rectOffset.left + rectOffset.width + posOffset,
          top: rectOffset.top - (tooltipOffset.height - rectOffset.height) / 2,
        }
        break
      case 'bottom':
        style = {
          left: rectOffset.left - (tooltipOffset.width - rectOffset.width) / 2,
          top: rectOffset.top + rectOffset.height + posOffset,
        }
        break
      case 'bottom-right':
        style = {
          left: rectOffset.left + rectOffset.width + posOffset,
          top: rectOffset.top + rectOffset.height + posOffset,
        }
        break
      case 'top':
        style = {
          left: rectOffset.left - (tooltipOffset.width - rectOffset.width) / 2,
          top: rectOffset.top - posOffset - tooltipOffset.height,
        }
        break
      default:
        return
    }
    setTooltipStyle(style)
  }, [side, ref])

  if (tooltip == null) {
    return <>{children}</>
  }

  return (
    <div
      onPointerEnter={() => handleMouseEnter()}
      onPointerLeave={() => handleMouseLeave()}
      onPointerOver={onMouseOver}
      onClick={() => handleMouseLeave()}
      className={className}
      ref={ref}
    >
      {children}
      {status == 'show' && (
        <Container
          className={cc(['tooltip__container', side])}
          style={tooltipStyle}
          ref={tooltipRef}
        >
          <div className='tooltip__base'>
            <span>{tooltip}</span>
          </div>
        </Container>
      )}
    </div>
  )
}

export default WithDelayedTooltip

const Container = styled.div`
  position: fixed;
  z-index: 100;
  width: max-content;
  min-width: 40px;
  text-align: center;
  pointer-events: none;

  > div {
    background-color: ${({ theme }) => theme.colors.background.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: 5px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

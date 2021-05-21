import React, {
  PropsWithChildren,
  useEffect,
  useState,
  CSSProperties,
  useRef,
} from 'react'
import { Rect } from '../../lib/selection/useSelectionLocation'

interface RangeTooltipProps {
  rect: Rect
  bufferTop?: number
}

const STYLE: CSSProperties = {
  position: 'absolute',
}

function SelectionTooltip({
  children,
  rect,
  bufferTop = -1,
}: PropsWithChildren<RangeTooltipProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ display: 'none' })

  useEffect(() => {
    if (containerRef.current == null) {
      setStyle({ display: 'none' })
      return
    }

    const topClose = rect.y < bufferTop
    const top = topClose ? rect.y + rect.height : rect.y
    let left = rect.x

    left = left + rect.width / 2

    const buffer = 20
    const tipHalfWidth = containerRef.current.offsetWidth / 2

    const realTipLeft = left - tipHalfWidth
    const realTipRight = realTipLeft + containerRef.current.offsetWidth

    if (realTipLeft < buffer) {
      left = buffer + tipHalfWidth
    } else if (realTipRight > window.innerWidth - buffer) {
      left = window.innerWidth - buffer - tipHalfWidth
    }

    setStyle({
      ...STYLE,
      left: left + 'px',
      top: top + 'px',
      transform: `translate(-50%, ${topClose ? '0' : 'calc(-100% - 5px)'})`,
    })
  }, [rect, bufferTop])

  return (
    <div style={style} ref={containerRef}>
      {children}
    </div>
  )
}

export default SelectionTooltip

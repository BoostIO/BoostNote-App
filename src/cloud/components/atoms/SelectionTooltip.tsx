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
}

const STYLE: CSSProperties = {
  position: 'absolute',
  transform: 'translate(-50%, calc(-100% - 12px))',
}

function SelectionTooltip({
  children,
  rect,
}: PropsWithChildren<RangeTooltipProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ display: 'none' })

  useEffect(() => {
    if (containerRef.current == null) {
      setStyle({ display: 'none' })
      return
    }

    const top = rect.y
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
    })
  }, [rect])

  return (
    <div style={style} ref={containerRef}>
      {children}
    </div>
  )
}

export default SelectionTooltip

import React, {
  PropsWithChildren,
  useEffect,
  useState,
  CSSProperties,
  useRef,
} from 'react'

interface RangeTooltipProps {
  selection: { selection: Selection }
}

const STYLE: CSSProperties = {
  position: 'absolute',
  transform: 'translate(50%, -100%)',
}

function SelectionTooltip({
  children,
  selection,
}: PropsWithChildren<RangeTooltipProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ display: 'none' })

  useEffect(() => {
    if (containerRef.current == null) {
      setStyle({ display: 'none' })
      return
    }

    const rect = selection.selection.getRangeAt(0).getBoundingClientRect()
    let { top, left } = rect

    if (containerRef.current.parentElement != null) {
      const {
        top: parentTop,
        left: parentLeft,
      } = containerRef.current.parentElement.getBoundingClientRect()
      left = left - parentLeft
      top = top - parentTop
    }

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
  }, [selection])

  return (
    <div style={style} ref={containerRef}>
      {children}
    </div>
  )
}

export default SelectionTooltip

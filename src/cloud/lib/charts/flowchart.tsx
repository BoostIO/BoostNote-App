import React, { useRef, useEffect, useState } from 'react'
import FlowChart from 'flowchart.js'

export interface FlowchartProps {
  code: string
  options?: any
}

export const Flowchart = ({ code, options }: FlowchartProps) => {
  const eleRef = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (eleRef.current == null) {
      return
    }

    try {
      const diagram = FlowChart.parse(code)
      while (eleRef.current.firstChild != null) {
        eleRef.current.removeChild(eleRef.current.lastChild!)
      }
      diagram.drawSVG(eleRef.current, options)
      const svg = eleRef.current.childNodes[0] as SVGElement
      if (svg != null && typeof svg.getAttribute('height') === 'string') {
        eleRef.current.style.setProperty(
          'height',
          `${svg.getAttribute('height')!}px`
        )
      }
      setErr(false)
    } catch (err) {
      setErr(true)
    }
  }, [code, options])

  if (err) {
    return <div>Flowchart parse error</div>
  }

  return <div ref={eleRef} />
}

import React, { useRef, useEffect, useState } from 'react'
import _Chart from 'chart.js'
import YAML from 'js-yaml'

interface ChartProps {
  config: string
  isYml?: boolean
}

_Chart.defaults.global.animation = undefined

export const Chart = ({ config, isYml = false }: ChartProps) => {
  const eleRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<{ destroy: Function }>()
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (eleRef.current == null) return

    if (chartRef.current != null) {
      chartRef.current.destroy()
    }

    try {
      setErr(false)
      const parsed = isYml ? YAML.load(config) : JSON.parse(config)
      chartRef.current = new _Chart(eleRef.current.getContext('2d'), parsed)
    } catch (err) {
      setErr(true)
    }
  }, [config, isYml])

  return (
    <div>
      {err && <div>Parse Error</div>}
      <canvas ref={eleRef} />
    </div>
  )
}
